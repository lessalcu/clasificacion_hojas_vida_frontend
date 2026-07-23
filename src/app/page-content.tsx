"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QueryBuilderOutlinedIcon from "@mui/icons-material/QueryBuilderOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";

import {
  ProcessingStatusPanel,
  StepStatusChip,
} from "@/components/processing/processing-status-panel";
import {
  uploadBatchCvs,
  uploadSingleCv,
} from "@/services/api/cv-upload/cv-upload-service";
import { useJobProfiles } from "@/services/api/job-profiles/use-job-profiles";
import {
  classifyCandidateProfiles,
  extractCandidateSource,
  getProcessingRanking,
  normalizeCandidateSource,
} from "@/services/api/processing/processing-service";
import type {
  CvBatchUploadItem,
  CvUploadResult,
} from "@/services/api/types/cv-upload";
import type {
  ClassificationResult,
  ProcessingQueueState,
} from "@/services/api/types/processing";

const MAX_FILES = 50;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const TOAST_DURATION = 5000;
const rankingOptions = [3, 5, 10, 20] as const;

type RankingOption = (typeof rankingOptions)[number];
type UploadStatus = "ready" | "uploading" | "uploaded" | "error";

type CvQueueItem = ProcessingQueueState & {
  key: string;
  file: File;
  status: UploadStatus;
  progress: number;
  result?: CvUploadResult;
  error?: string;
};

type HelpTooltipProps = {
  title: string;
};

const HelpTooltip = ({ title }: HelpTooltipProps) => (
  <Tooltip title={title} arrow placement="top" enterDelay={200}>
    <IconButton
      size="small"
      aria-label={title}
      sx={{ width: 28, height: 28, ml: 0.25, color: "text.secondary" }}
    >
      <HelpOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Tooltip>
);

type StepTitleProps = {
  number: number;
  title: string;
  help: string;
};

const StepTitle = ({ number, title, help }: StepTitleProps) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 30,
        height: 30,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: "#fff",
        backgroundColor: "primary.main",
        fontWeight: 800,
      }}
    >
      {number}
    </Box>

    <Typography variant="subtitle1" fontWeight={800} color="#10275b">
      {title}
    </Typography>

    <HelpTooltip title={help} />
  </Stack>
);

type SummaryCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  caption: string;
};

const SummaryCard = ({ icon, value, label, caption }: SummaryCardProps) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: "100%" }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 46,
          height: 46,
          display: "grid",
          placeItems: "center",
          borderRadius: 2.5,
          backgroundColor: "#edf4ff",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          {value}
        </Typography>

        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
      </Box>
    </Stack>

    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mt: 1.25, display: "block" }}
    >
      {caption}
    </Typography>
  </Paper>
);

const createInitialProcessingState = (): ProcessingQueueState => ({
  extractionStatus: "pending",
  normalizationStatus: "pending",
  classificationStatus: "pending",
});

const getFileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado.";

const HomePageContent = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: jobProfiles = [],
    isLoading: isLoadingProfiles,
    isError: isProfilesError,
    error: profilesError,
  } = useJobProfiles();

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [rankingLimit, setRankingLimit] = useState<RankingOption>(5);
  const [queue, setQueue] = useState<CvQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState(
    "Selecciona un perfil y carga las hojas de vida para iniciar."
  );
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [processingFailed, setProcessingFailed] = useState(false);
  const [processingRunId, setProcessingRunId] = useState<string | null>(null);
  const [rankingResults, setRankingResults] = useState<ClassificationResult[]>(
    []
  );

  const selectedProfile = useMemo(
    () => jobProfiles.find((profile) => profile.id === selectedProfileId),
    [jobProfiles, selectedProfileId]
  );

  const uploadedItems = useMemo(
    () => queue.filter((item) => item.status === "uploaded"),
    [queue]
  );

  const pendingItems = useMemo(
    () =>
      queue.filter(
        (item) => item.status === "ready" || item.status === "error"
      ),
    [queue]
  );

  const processedItems = useMemo(
    () =>
      queue.filter(
        (item) =>
          item.status === "uploaded" &&
          item.classificationStatus === "completed"
      ),
    [queue]
  );

  const canUpload = pendingItems.length > 0 && !isUploading && !isProcessing;

  const canStartClassification =
    Boolean(selectedProfileId) &&
    uploadedItems.length > 0 &&
    !isUploading &&
    !isProcessing;

  const updateQueueItem = (
    key: string,
    changes: Partial<CvQueueItem>
  ) => {
    setQueue((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  };

  const addFiles = (incomingFiles: File[]) => {
    const invalidTypeFiles: string[] = [];
    const oversizedFiles: string[] = [];
    const validFiles: File[] = [];

    incomingFiles.forEach((file) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        invalidTypeFiles.push(file.name);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedFiles.push(file.name);
        return;
      }

      validFiles.push(file);
    });

    if (invalidTypeFiles.length > 0) {
      toast.error(
        `Solo se permiten archivos PDF: ${invalidTypeFiles.join(", ")}`,
        { autoClose: TOAST_DURATION }
      );
    }

    if (oversizedFiles.length > 0) {
      toast.error(
        `El tamaño máximo por archivo es 10 MB: ${oversizedFiles.join(", ")}`,
        { autoClose: TOAST_DURATION }
      );
    }

    setQueue((current) => {
      const currentKeys = new Set(current.map((item) => item.key));
      const availableSlots = MAX_FILES - current.length;

      const accepted = validFiles
        .filter((file) => !currentKeys.has(getFileKey(file)))
        .slice(0, Math.max(availableSlots, 0));

      if (accepted.length < validFiles.length) {
        toast.warning(
          `Solo se permiten hasta ${MAX_FILES} archivos por carga.`,
          { autoClose: TOAST_DURATION }
        );
      }

      return [
        ...current,
        ...accepted.map((file) => ({
          key: getFileKey(file),
          file,
          status: "ready" as const,
          progress: 0,
          ...createInitialProcessingState(),
        })),
      ];
    });

    setProcessingCompleted(false);
    setProcessingFailed(false);
    setProcessingProgress(0);
    setProcessingMessage(
      "Selecciona un perfil y carga las hojas de vida para iniciar."
    );
    setProcessingRunId(null);
    setRankingResults([]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isUploading && !isProcessing) {
      addFiles(Array.from(event.dataTransfer.files ?? []));
    }
  };

  const removeItem = (key: string) => {
    if (isUploading || isProcessing) {
      return;
    }

    setQueue((current) => current.filter((item) => item.key !== key));
  };

  const clearQueue = () => {
    if (!isUploading && !isProcessing) {
      setQueue([]);
      setProcessingCompleted(false);
      setProcessingFailed(false);
      setProcessingProgress(0);
      setProcessingRunId(null);
      setRankingResults([]);
      setProcessingMessage(
        "Selecciona un perfil y carga las hojas de vida para iniciar."
      );
    }
  };

  const updatePendingProgress = (progress: number) => {
    setBatchProgress(progress);

    setQueue((current) =>
      current.map((item) =>
        item.status === "uploading" ? { ...item, progress } : item
      )
    );
  };

  const applySingleResult = (itemKey: string, result: CvUploadResult) => {
    setQueue((current) =>
      current.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              status: "uploaded",
              progress: 100,
              result,
              error: undefined,
              ...createInitialProcessingState(),
            }
          : item
      )
    );
  };

  const applyBatchResults = (
    itemsToUpload: CvQueueItem[],
    results: CvBatchUploadItem[]
  ) => {
    setQueue((current) =>
      current.map((item) => {
        const index = itemsToUpload.findIndex(
          (candidate) => candidate.key === item.key
        );

        if (index < 0) {
          return item;
        }

        const uploadResult = results[index];

        if (!uploadResult) {
          return {
            ...item,
            status: "error",
            progress: 0,
            error: "El servidor no devolvió un resultado para este archivo.",
          };
        }

        if (uploadResult.success) {
          return {
            ...item,
            status: "uploaded",
            progress: 100,
            result: uploadResult.result,
            error: undefined,
            ...createInitialProcessingState(),
          };
        }

        return {
          ...item,
          status: "error",
          progress: 0,
          error: uploadResult.error,
        };
      })
    );
  };

  const markUploadFailure = (itemsToUpload: CvQueueItem[], message: string) => {
    const keys = new Set(itemsToUpload.map((item) => item.key));

    setQueue((current) =>
      current.map((item) =>
        keys.has(item.key)
          ? { ...item, status: "error", progress: 0, error: message }
          : item
      )
    );
  };

  const handleUpload = async () => {
    const itemsToUpload = queue.filter(
      (item) => item.status === "ready" || item.status === "error"
    );

    if (itemsToUpload.length === 0) {
      toast.info("No existen archivos pendientes de carga.", {
        autoClose: TOAST_DURATION,
      });
      return;
    }

    setIsUploading(true);
    setBatchProgress(0);

    setQueue((current) =>
      current.map((item) =>
        itemsToUpload.some((candidate) => candidate.key === item.key)
          ? { ...item, status: "uploading", progress: 0, error: undefined }
          : item
      )
    );

    try {
      if (itemsToUpload.length === 1) {
        const item = itemsToUpload[0];
        const result = await uploadSingleCv(item.file, updatePendingProgress);

        applySingleResult(item.key, result);

        toast.success(`Se cargó correctamente ${item.file.name}.`, {
          autoClose: TOAST_DURATION,
        });
      } else {
        const results = await uploadBatchCvs(
          itemsToUpload.map((item) => item.file),
          updatePendingProgress
        );

        applyBatchResults(itemsToUpload, results);

        const successful = results.filter((item) => item.success).length;
        const failed = results.length - successful;

        if (successful > 0) {
          toast.success(
            `${successful} hoja${successful === 1 ? "" : "s"} de vida cargada${
              successful === 1 ? "" : "s"
            } correctamente.`,
            { autoClose: TOAST_DURATION }
          );
        }

        if (failed > 0) {
          toast.error(
            `${failed} archivo${failed === 1 ? "" : "s"} no pudo${
              failed === 1 ? "" : "ieron"
            } cargarse. Revisa el detalle en la lista.`,
            { autoClose: TOAST_DURATION }
          );
        }
      }
    } catch (error) {
      const message = getErrorMessage(error);
      markUploadFailure(itemsToUpload, message);
      toast.error(message, { autoClose: TOAST_DURATION });
    } finally {
      setIsUploading(false);
      setBatchProgress(0);
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedProfileId) {
      toast.error("Selecciona un perfil del puesto.", {
        autoClose: TOAST_DURATION,
      });
      return;
    }

    const itemsToProcess = queue.filter(
      (item) => item.status === "uploaded" && item.result
    );

    if (itemsToProcess.length === 0) {
      toast.error("Carga al menos una hoja de vida antes de procesar.", {
        autoClose: TOAST_DURATION,
      });
      return;
    }

    setIsProcessing(true);
    setProcessingCompleted(false);
    setProcessingFailed(false);
    setProcessingRunId(null);
    setRankingResults([]);
    setProcessingProgress(0);

    setQueue((current) =>
      current.map((item) =>
        item.status === "uploaded"
          ? {
              ...item,
              ...createInitialProcessingState(),
              processingError: undefined,
              candidateProfileId: undefined,
              rankPosition: undefined,
              predictedLabel: undefined,
              score: undefined,
            }
          : item
      )
    );

    const totalSteps = itemsToProcess.length * 2 + 1;
    let completedSteps = 0;
    const normalizedItems: Array<{
      key: string;
      candidateProfileId: string;
    }> = [];
    let failedFiles = 0;

    const updateGeneralProgress = () => {
      setProcessingProgress(
        Math.min(100, Math.round((completedSteps / totalSteps) * 100))
      );
    };

    try {
      for (let index = 0; index < itemsToProcess.length; index += 1) {
        const item = itemsToProcess[index];
        const sourceId = item.result?.candidate_source.id;

        if (!sourceId) {
          failedFiles += 1;
          updateQueueItem(item.key, {
            extractionStatus: "failed",
            normalizationStatus: "failed",
            classificationStatus: "failed",
            processingError: "No se encontró el ID de la fuente PDF.",
          });
          continue;
        }

        setProcessingMessage(
          `Extrayendo texto de ${item.file.name} (${index + 1} de ${
            itemsToProcess.length
          })`
        );
        updateQueueItem(item.key, {
          extractionStatus: "processing",
        });

        try {
          const extraction = await extractCandidateSource(sourceId);

          if (extraction.status !== "processed") {
            throw new Error(
              extraction.reason || "No se pudo extraer texto útil del PDF."
            );
          }

          updateQueueItem(item.key, {
            extractionStatus: "completed",
          });
          completedSteps += 1;
          updateGeneralProgress();

          setProcessingMessage(
            `Normalizando perfil de ${item.file.name} (${index + 1} de ${
              itemsToProcess.length
            })`
          );
          updateQueueItem(item.key, {
            normalizationStatus: "processing",
          });

          const normalization = await normalizeCandidateSource(sourceId);
          const candidateProfileId = normalization.candidate_profile.id;

          if (!candidateProfileId) {
            throw new Error(
              "El backend no devolvió el identificador del perfil normalizado."
            );
          }

          normalizedItems.push({
            key: item.key,
            candidateProfileId,
          });

          updateQueueItem(item.key, {
            normalizationStatus: "completed",
            candidateProfileId,
          });
          completedSteps += 1;
          updateGeneralProgress();
        } catch (error) {
          failedFiles += 1;
          const message = getErrorMessage(error);

          updateQueueItem(item.key, {
            extractionStatus:
              item.extractionStatus === "processing"
                ? "failed"
                : item.extractionStatus,
            normalizationStatus: "failed",
            classificationStatus: "failed",
            processingError: message,
          });
        }
      }

      if (normalizedItems.length === 0) {
        throw new Error(
          "Ninguna hoja de vida pudo completar la extracción y normalización."
        );
      }

      setProcessingMessage(
        `Clasificando ${normalizedItems.length} candidato${
          normalizedItems.length === 1 ? "" : "s"
        } y generando el Top ${rankingLimit}.`
      );

      setQueue((current) =>
        current.map((item) =>
          normalizedItems.some((normalized) => normalized.key === item.key)
            ? {
                ...item,
                classificationStatus: "processing",
              }
            : item
        )
      );

      const classification = await classifyCandidateProfiles({
        jobProfileId: selectedProfileId,
        candidateProfileIds: normalizedItems.map(
          (item) => item.candidateProfileId
        ),
        topK: rankingLimit,
      });

      let finalResults = classification.results;

      if (classification.processing_run_id) {
        setProcessingRunId(classification.processing_run_id);

        const ranking = await getProcessingRanking(
          classification.processing_run_id,
          rankingLimit
        );

        finalResults = ranking.results;
      }

      setRankingResults(finalResults);

      const resultMap = new Map(
        finalResults.map((result) => [result.candidate_profile_id, result])
      );

      setQueue((current) =>
        current.map((item) => {
          const normalized = normalizedItems.find(
            (candidate) => candidate.key === item.key
          );

          if (!normalized) {
            return item;
          }

          const result = resultMap.get(normalized.candidateProfileId);

          return {
            ...item,
            classificationStatus: "completed",
            rankPosition: result?.rank_position,
            predictedLabel: result?.predicted_label,
            score: result?.score_0_100,
            processingError: result?.error || undefined,
          };
        })
      );

      completedSteps += 1;
      updateGeneralProgress();
      setProcessingProgress(100);

      if (failedFiles > 0) {
        setProcessingMessage(
          `Proceso completado con observaciones: ${normalizedItems.length} hoja${
            normalizedItems.length === 1 ? "" : "s"
          } procesada${normalizedItems.length === 1 ? "" : "s"} y ${failedFiles} fallida${
            failedFiles === 1 ? "" : "s"
          }.`
        );

        toast.warning(
          `La clasificación terminó, pero ${failedFiles} archivo${
            failedFiles === 1 ? "" : "s"
          } no pudo${failedFiles === 1 ? "" : "ieron"} procesarse.`,
          { autoClose: TOAST_DURATION }
        );
      } else {
        setProcessingMessage(
          `Proceso completado correctamente. Ranking Top ${rankingLimit} generado.`
        );

        toast.success(
          `Proceso completado correctamente. Se generó el ranking Top ${rankingLimit}.`,
          { autoClose: TOAST_DURATION }
        );
      }

      setProcessingCompleted(true);
    } catch (error) {
      const message = getErrorMessage(error);

      setProcessingFailed(true);
      setProcessingMessage(`El proceso falló: ${message}`);

      setQueue((current) =>
        current.map((item) =>
          item.classificationStatus === "processing"
            ? {
                ...item,
                classificationStatus: "failed",
                processingError: message,
              }
            : item
        )
      );

      toast.error(message, {
        autoClose: TOAST_DURATION,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPdf = (file: File) => {
    const url = URL.createObjectURL(file);
    const opened = window.open(url, "_blank", "noopener,noreferrer");

    if (!opened) {
      toast.error("El navegador bloqueó la apertura del PDF.", {
        autoClose: TOAST_DURATION,
      });
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const renderUploadStatus = (item: CvQueueItem) => {
    if (item.status === "uploaded") {
      return <Chip label="Cargado" size="small" color="success" />;
    }

    if (item.status === "uploading") {
      return (
        <Chip
          label={`Cargando ${item.progress}%`}
          size="small"
          color="primary"
        />
      );
    }

    if (item.status === "error") {
      return <Chip label="Error" size="small" color="error" />;
    }

    return <Chip label="Listo para cargar" size="small" variant="outlined" />;
  };

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ManageSearchOutlinedIcon color="primary" />

          <Typography variant="h5" fontWeight={800} color="#10275b">
            Evaluación y clasificación de hojas de vida
          </Typography>

          <HelpTooltip title="Selecciona un perfil, carga los PDF, configura el ranking y ejecuta el flujo de extracción, normalización y clasificación." />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Los archivos cargados se almacenan en la base de datos y quedan
          disponibles para extracción, clasificación y entrenamiento posterior.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        {isLoadingProfiles && <LinearProgress sx={{ mb: 2 }} />}

        {isProfilesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No se pudieron consultar los perfiles.{" "}
            {getErrorMessage(profilesError)}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1.35fr 0.75fr" },
            gap: { xs: 3, lg: 0 },
          }}
        >
          <Box sx={{ pr: { lg: 3 } }}>
            <StepTitle
              number={1}
              title="Selecciona el perfil del puesto"
              help="Este perfil se utilizará para comparar, clasificar y ordenar los candidatos."
            />

            <FormControl
              fullWidth
              sx={{ mt: 2.5 }}
              disabled={jobProfiles.length === 0 || isProcessing}
            >
              <InputLabel id="job-profile-label">Perfil del puesto</InputLabel>

              <Select
                labelId="job-profile-label"
                value={selectedProfileId}
                label="Perfil del puesto"
                onChange={(event) => {
                  setSelectedProfileId(event.target.value);
                  setProcessingCompleted(false);
                  setProcessingFailed(false);
                  setRankingResults([]);
                  setProcessingRunId(null);
                }}
                startAdornment={
                  <WorkOutlineIcon color="primary" sx={{ mr: 1.5 }} />
                }
              >
                {jobProfiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    {profile.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProfile && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>{selectedProfile.title}</strong>
                <br />
                {selectedProfile.description}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              px: { lg: 3 },
              borderLeft: { lg: "1px solid #e4e9f0" },
              borderRight: { lg: "1px solid #e4e9f0" },
            }}
          >
            <StepTitle
              number={2}
              title="Carga hojas de vida (PDF)"
              help="Acepta carga individual o múltiple. Cada PDF puede pesar hasta 10 MB y cada lote hasta 50 archivos."
            />

            <Box
              role="button"
              tabIndex={0}
              onClick={() =>
                !isUploading &&
                !isProcessing &&
                fileInputRef.current?.click()
              }
              onKeyDown={(event) => {
                if (
                  !isUploading &&
                  !isProcessing &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!isUploading && !isProcessing) {
                  setIsDragging(true);
                }
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              sx={{
                mt: 2.5,
                minHeight: 185,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                cursor:
                  isUploading || isProcessing ? "not-allowed" : "pointer",
                border: "2px dashed",
                borderColor: isDragging ? "primary.main" : "#a9c9f5",
                borderRadius: 3,
                backgroundColor: isDragging
                  ? "rgba(25,118,210,.07)"
                  : "#fbfdff",
                opacity: isUploading || isProcessing ? 0.7 : 1,
              }}
            >
              <Stack spacing={1} alignItems="center" sx={{ p: 2 }}>
                <CloudUploadOutlinedIcon
                  color="primary"
                  sx={{ fontSize: 56 }}
                />

                <Typography fontWeight={800} color="primary.main">
                  Arrastra y suelta tus archivos PDF aquí
                </Typography>

                <Typography variant="body2" color="primary.main">
                  o presiona para seleccionarlos
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Máximo 50 archivos · 10 MB por archivo
                </Typography>
              </Stack>
            </Box>

            <input
              ref={fileInputRef}
              hidden
              type="file"
              multiple
              accept="application/pdf,.pdf"
              onChange={handleInputChange}
            />

            {queue.length > 0 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  startIcon={<UploadFileOutlinedIcon />}
                  onClick={() => void handleUpload()}
                  disabled={!canUpload}
                >
                  {isUploading ? "Cargando..." : "Cargar hojas de vida"}
                </Button>

                <Button
                  color="error"
                  onClick={clearQueue}
                  disabled={isUploading || isProcessing}
                >
                  Quitar todos
                </Button>
              </Stack>
            )}

            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>
                    Cargando archivos al servidor
                  </Typography>

                  <Typography variant="body2">{batchProgress}%</Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={batchProgress}
                  sx={{ mt: 0.75 }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ pl: { lg: 3 } }}>
            <StepTitle
              number={3}
              title="Configura el ranking"
              help="Selecciona si deseas mostrar el Top 3, Top 5, Top 10 o Top 20."
            />

            <FormControl fullWidth sx={{ mt: 2.5 }} disabled={isProcessing}>
              <InputLabel id="ranking-label">Mostrar resultados</InputLabel>

              <Select
                labelId="ranking-label"
                value={rankingLimit}
                label="Mostrar resultados"
                onChange={(event) =>
                  setRankingLimit(Number(event.target.value) as RankingOption)
                }
                startAdornment={
                  <TuneOutlinedIcon color="primary" sx={{ mr: 1.5 }} />
                }
              >
                {rankingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    Top {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              El sistema procesará los PDF cargados y ordenará los candidatos
              de mayor a menor score.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: canStartClassification
              ? "rgba(46,125,50,.04)"
              : "#fafbfc",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Iniciar clasificación
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Requiere un perfil seleccionado y hojas de vida cargadas
                correctamente.
              </Typography>
            </Box>

            <Tooltip
              title={
                canStartClassification
                  ? "Ejecutar extracción, normalización, clasificación y ranking."
                  : "Selecciona un perfil y carga al menos una hoja de vida."
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() => void handleStartProcessing()}
                  disabled={!canStartClassification}
                >
                  {isProcessing
                    ? "Procesando..."
                    : "Iniciar clasificación"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      </Paper>

      {(uploadedItems.length > 0 ||
        isProcessing ||
        processingCompleted ||
        processingFailed) && (
        <ProcessingStatusPanel
          isProcessing={isProcessing}
          progress={processingProgress}
          currentMessage={processingMessage}
          completed={processingCompleted}
          failed={processingFailed}
          totalFiles={uploadedItems.length}
          processedFiles={processedItems.length}
        />
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2.5, borderBottom: "1px solid #e4e9f0" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="#10275b">
                Hojas de vida del proceso
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Consulta el estado de carga, extracción, normalización y
                clasificación de cada PDF.
              </Typography>

              {processingRunId && (
                <Typography variant="caption" color="text.secondary">
                  Ejecución: {processingRunId}
                </Typography>
              )}
            </Box>

            <Chip label={`${uploadedItems.length} cargadas`} color="primary" />
          </Stack>
        </Box>

        {queue.length === 0 ? (
          <Box
            sx={{
              minHeight: 230,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              p: 3,
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <DescriptionOutlinedIcon
                sx={{ fontSize: 56, color: "text.disabled" }}
              />

              <Typography fontWeight={700}>
                Aún no se han seleccionado hojas de vida
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Agrega uno o varios archivos PDF para iniciar la carga.
              </Typography>
            </Stack>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1450 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f6f8fb" }}>
                  <TableCell>Archivo</TableCell>
                  <TableCell align="center">Carga</TableCell>
                  <TableCell align="center">Extracción</TableCell>
                  <TableCell align="center">Normalización</TableCell>
                  <TableCell align="center">Clasificación</TableCell>
                  <TableCell align="center">Posición</TableCell>
                  <TableCell align="center">Resultado</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.key} hover>
                    <TableCell sx={{ minWidth: 270 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <PictureAsPdfOutlinedIcon color="error" />

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {item.file.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(item.file.size)}
                          </Typography>

                          {(item.error || item.processingError) && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ display: "block", maxWidth: 300 }}
                            >
                              {item.error || item.processingError}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack spacing={0.5} sx={{ minWidth: 120 }}>
                        {renderUploadStatus(item)}

                        {item.status === "uploading" && (
                          <LinearProgress
                            variant="determinate"
                            value={item.progress}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <StepStatusChip status={item.extractionStatus} />
                    </TableCell>

                    <TableCell align="center">
                      <StepStatusChip status={item.normalizationStatus} />
                    </TableCell>

                    <TableCell align="center">
                      <StepStatusChip status={item.classificationStatus} />
                    </TableCell>

                    <TableCell align="center">
                      {item.rankPosition ? (
                        <Chip
                          label={`#${item.rankPosition}`}
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Typography color="text.secondary">--</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      {item.classificationStatus === "completed" &&
                      item.predictedLabel !== undefined ? (
                        <Chip
                          label={item.predictedLabel ? "Apto" : "No apto"}
                          size="small"
                          color={item.predictedLabel ? "success" : "default"}
                        />
                      ) : (
                        <Typography color="text.secondary">--</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      {typeof item.score === "number" ? (
                        <Typography fontWeight={800} color="primary.main">
                          {item.score.toFixed(2)}
                        </Typography>
                      ) : (
                        <Skeleton
                          variant="rounded"
                          width={64}
                          height={28}
                          sx={{ mx: "auto" }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Ver PDF">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenPdf(item.file)}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          item.status === "uploaded"
                            ? "El registro ya fue cargado en el backend"
                            : "Quitar archivo"
                        }
                      >
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(item.key)}
                            disabled={
                              isUploading ||
                              isProcessing ||
                              item.status === "uploaded"
                            }
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {rankingResults.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid #e4e9f0" }}>
            <Typography variant="h6" fontWeight={800} color="#10275b">
              Ranking Top {rankingLimit}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Candidatos ordenados de mayor a menor score de afinidad.
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f6f8fb" }}>
                  <TableCell align="center">Posición</TableCell>
                  <TableCell>Perfil del candidato</TableCell>
                  <TableCell align="center">Clasificación</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell>Modelo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rankingResults.map((result) => (
                  <TableRow key={result.candidate_profile_id} hover>
                    <TableCell align="center">
                      <Chip
                        label={`#${result.rank_position ?? "--"}`}
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {result.candidate_profile_id}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={result.predicted_label ? "Apto" : "No apto"}
                        color={result.predicted_label ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={800} color="primary.main">
                        {Number(result.score_0_100 ?? 0).toFixed(2)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {result.algorithm ?? "Modelo activo"}
                      </Typography>

                      {result.version_tag && (
                        <Typography variant="caption" color="text.secondary">
                          {result.version_tag}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Box>
        <Typography
          variant="h6"
          fontWeight={800}
          color="#10275b"
          sx={{ mb: 1.5 }}
        >
          Resumen del proceso
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(6, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <SummaryCard
            icon={<DescriptionOutlinedIcon />}
            value={queue.length}
            label="PDF seleccionados"
            caption="Archivos agregados en la interfaz"
          />

          <SummaryCard
            icon={<CheckCircleOutlineIcon />}
            value={uploadedItems.length}
            label="PDF cargados"
            caption="Registros persistidos en el backend"
          />

          <SummaryCard
            icon={<ErrorOutlineIcon />}
            value={
              queue.filter(
                (item) =>
                  item.status === "error" ||
                  item.extractionStatus === "failed" ||
                  item.normalizationStatus === "failed" ||
                  item.classificationStatus === "failed"
              ).length
            }
            label="Errores del proceso"
            caption="Archivos que requieren revisión"
          />

          <SummaryCard
            icon={<ManageSearchOutlinedIcon />}
            value={processedItems.length}
            label="Procesados"
            caption="Extracción, normalización y clasificación completadas"
          />

          <SummaryCard
            icon={<AssessmentOutlinedIcon />}
            value={
              rankingResults.length > 0
                ? Math.max(
                    ...rankingResults.map((result) =>
                      Number(result.score_0_100 ?? 0)
                    )
                  ).toFixed(2)
                : "--"
            }
            label="Mejor score"
            caption="Mayor afinidad obtenida"
          />

          <SummaryCard
            icon={<QueryBuilderOutlinedIcon />}
            value={processingCompleted ? "100 %" : `${processingProgress} %`}
            label="Avance general"
            caption="Estado actual del procesamiento"
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default HomePageContent;