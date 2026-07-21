"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";

import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
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
  uploadBatchCvs,
  uploadSingleCv,
} from "@/services/api/cv-upload/cv-upload-service";
import { useJobProfiles } from "@/services/api/job-profiles/use-job-profiles";
import type {
  CvBatchUploadItem,
  CvUploadResult,
} from "@/services/api/types/cv-upload";

const MAX_FILES = 50;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const TOAST_DURATION = 5000;

const UPLOADED_CV_HASHES_STORAGE_KEY = "uploaded_cv_sha256_history";

const rankingOptions = [3, 5, 10, 20] as const;

type RankingOption = (typeof rankingOptions)[number];

type UploadStatus = "ready" | "uploading" | "uploaded" | "error";

type CvQueueItem = {
  key: string;
  fingerprint: string;
  file: File;
  status: UploadStatus;
  progress: number;
  result?: CvUploadResult;
  error?: string;
};

type HelpTooltipProps = {
  title: string;
};

type StepTitleProps = {
  number: number;
  title: string;
  help: string;
};

type SummaryCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  caption: string;
};

const HelpTooltip = ({ title }: HelpTooltipProps) => (
  <Tooltip title={title} arrow placement="top" enterDelay={200}>
    <IconButton
      size="small"
      aria-label={title}
      sx={{
        width: 28,
        height: 28,
        ml: 0.25,
        color: "text.secondary",
      }}
    >
      <HelpOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Tooltip>
);

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

const SummaryCard = ({ icon, value, label, caption }: SummaryCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 3,
      height: "100%",
    }}
  >
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
      sx={{
        mt: 1.25,
        display: "block",
      }}
    >
      {caption}
    </Typography>
  </Paper>
);

const getFileKey = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
};

const calculateFileSha256 = async (file: File): Promise<string> => {
  const fileBuffer = await file.arrayBuffer();

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", fileBuffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const getUploadedCvHashes = (): Set<string> => {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const storedValue = window.localStorage.getItem(
      UPLOADED_CV_HASHES_STORAGE_KEY
    );

    if (!storedValue) {
      return new Set();
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return new Set();
    }

    return new Set(
      parsedValue.filter((value): value is string => typeof value === "string")
    );
  } catch {
    return new Set();
  }
};

const rememberUploadedCvHash = (fingerprint: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const storedHashes = getUploadedCvHashes();

  storedHashes.add(fingerprint);

  window.localStorage.setItem(
    UPLOADED_CV_HASHES_STORAGE_KEY,
    JSON.stringify(Array.from(storedHashes))
  );
};

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

  const [isCheckingFiles, setIsCheckingFiles] = useState(false);

  const [batchProgress, setBatchProgress] = useState(0);

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

  const canUpload = pendingItems.length > 0 && !isUploading && !isCheckingFiles;

  const canStartClassification = false;

  const addFiles = async (incomingFiles: File[]): Promise<void> => {
    if (incomingFiles.length === 0) {
      return;
    }

    setIsCheckingFiles(true);

    try {
      const invalidTypeFiles: string[] = [];
      const oversizedFiles: string[] = [];
      const repeatedSelectionFiles: string[] = [];
      const previouslyUploadedFiles: string[] = [];
      const acceptedItems: CvQueueItem[] = [];

      const currentFingerprints = new Set(
        queue.map((item) => item.fingerprint)
      );

      const uploadedFingerprints = getUploadedCvHashes();

      const availableSlots = Math.max(MAX_FILES - queue.length, 0);

      const filesWithinLimit = incomingFiles.slice(0, availableSlots);

      if (incomingFiles.length > availableSlots) {
        toast.warning(
          `Solo se pueden seleccionar hasta ${MAX_FILES} archivos por carga.`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      for (const file of filesWithinLimit) {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          invalidTypeFiles.push(file.name);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          oversizedFiles.push(file.name);
          continue;
        }

        try {
          const fingerprint = await calculateFileSha256(file);

          if (
            currentFingerprints.has(fingerprint) ||
            acceptedItems.some((item) => item.fingerprint === fingerprint)
          ) {
            repeatedSelectionFiles.push(file.name);
            continue;
          }

          if (uploadedFingerprints.has(fingerprint)) {
            previouslyUploadedFiles.push(file.name);
            continue;
          }

          acceptedItems.push({
            key: getFileKey(file),
            fingerprint,
            file,
            status: "ready",
            progress: 0,
          });

          currentFingerprints.add(fingerprint);
        } catch {
          toast.error(`No se pudo verificar el archivo "${file.name}".`, {
            autoClose: TOAST_DURATION,
          });
        }
      }

      if (invalidTypeFiles.length > 0) {
        toast.error(
          `Solo se permiten archivos PDF: ${invalidTypeFiles.join(", ")}`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      if (oversizedFiles.length > 0) {
        toast.error(
          `El tamaño máximo por archivo es 10 MB: ${oversizedFiles.join(", ")}`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      if (repeatedSelectionFiles.length > 0) {
        toast.warning(
          repeatedSelectionFiles.length === 1
            ? `El archivo "${repeatedSelectionFiles[0]}" ya está seleccionado en esta carga.`
            : `Estos archivos ya están seleccionados en esta carga: ${repeatedSelectionFiles.join(
                ", "
              )}`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      if (previouslyUploadedFiles.length > 0) {
        toast.warning(
          previouslyUploadedFiles.length === 1
            ? `El archivo "${previouslyUploadedFiles[0]}" ya fue cargado anteriormente y no puede volver a subirse.`
            : `Estos archivos ya fueron cargados anteriormente y no pueden volver a subirse: ${previouslyUploadedFiles.join(
                ", "
              )}`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      if (acceptedItems.length === 0) {
        return;
      }

      setQueue((currentQueue) => [...currentQueue, ...acceptedItems]);

      toast.success(
        acceptedItems.length === 1
          ? "Hoja de vida lista para cargar."
          : `${acceptedItems.length} hojas de vida listas para cargar.`,
        {
          autoClose: TOAST_DURATION,
        }
      );
    } finally {
      setIsCheckingFiles(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    void addFiles(selectedFiles);

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading || isCheckingFiles) {
      return;
    }

    void addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const removeItem = (key: string) => {
    if (isUploading) {
      return;
    }

    setQueue((current) => current.filter((item) => item.key !== key));
  };

  const clearQueue = () => {
    if (!isUploading) {
      setQueue([]);
    }
  };

  const updatePendingProgress = (progress: number) => {
    setBatchProgress(progress);

    setQueue((current) =>
      current.map((item) =>
        item.status === "uploading"
          ? {
              ...item,
              progress,
            }
          : item
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
            }
          : item
      )
    );
  };

  const applyBatchResults = (
    itemsToUpload: CvQueueItem[],
    results: CvBatchUploadItem[]
  ) => {
    results.forEach((uploadResult, index) => {
      if (!uploadResult?.success) {
        return;
      }

      const uploadedItem = itemsToUpload[index];

      if (uploadedItem) {
        rememberUploadedCvHash(uploadedItem.fingerprint);
      }
    });

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
          ? {
              ...item,
              status: "error",
              progress: 0,
              error: message,
            }
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
          ? {
              ...item,
              status: "uploading",
              progress: 0,
              error: undefined,
            }
          : item
      )
    );

    try {
      if (itemsToUpload.length === 1) {
        const item = itemsToUpload[0];

        const result = await uploadSingleCv(item.file, updatePendingProgress);

        rememberUploadedCvHash(item.fingerprint);
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
            {
              autoClose: TOAST_DURATION,
            }
          );
        }

        if (failed > 0) {
          toast.error(
            `${failed} archivo${failed === 1 ? "" : "s"} no pudo${
              failed === 1 ? "" : "ieron"
            } cargarse. Revisa el detalle en la lista.`,
            {
              autoClose: TOAST_DURATION,
            }
          );
        }
      }
    } catch (error) {
      const message = getErrorMessage(error);

      markUploadFailure(itemsToUpload, message);

      toast.error(message, {
        autoClose: TOAST_DURATION,
      });
    } finally {
      setIsUploading(false);
      setBatchProgress(0);
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
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ManageSearchOutlinedIcon color="primary" />

          <Typography variant="h5" fontWeight={800} color="#10275b">
            Evaluación y clasificación de hojas de vida
          </Typography>

          <HelpTooltip title="Selecciona un perfil, carga los PDF, configura el ranking y posteriormente ejecuta la clasificación." />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Los archivos cargados se almacenan en la base de datos y quedan
          disponibles para extracción, clasificación y entrenamiento posterior.
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
        }}
      >
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
            gridTemplateColumns: {
              xs: "1fr",
              lg: "0.9fr 1.35fr 0.75fr",
            },
            gap: {
              xs: 3,
              lg: 0,
            },
          }}
        >
          <Box sx={{ pr: { lg: 3 } }}>
            <StepTitle
              number={1}
              title="Selecciona el perfil del puesto"
              help="Este perfil será usado posteriormente para comparar y clasificar los candidatos."
            />

            <FormControl
              fullWidth
              sx={{ mt: 2.5 }}
              disabled={jobProfiles.length === 0}
            >
              <InputLabel id="job-profile-label">Perfil del puesto</InputLabel>

              <Select
                labelId="job-profile-label"
                value={selectedProfileId}
                label="Perfil del puesto"
                onChange={(event) => setSelectedProfileId(event.target.value)}
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
              px: {
                lg: 3,
              },
              borderLeft: {
                lg: "1px solid #e4e9f0",
              },
              borderRight: {
                lg: "1px solid #e4e9f0",
              },
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
              onClick={() => {
                if (!isUploading && !isCheckingFiles) {
                  fileInputRef.current?.click();
                }
              }}
              onKeyDown={(event) => {
                if (
                  !isUploading &&
                  !isCheckingFiles &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();

                if (!isUploading && !isCheckingFiles) {
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
                  isUploading || isCheckingFiles ? "not-allowed" : "pointer",
                border: "2px dashed",
                borderColor: isDragging ? "primary.main" : "#a9c9f5",
                borderRadius: 3,
                backgroundColor: isDragging
                  ? "rgba(25,118,210,.07)"
                  : "#fbfdff",
                opacity: isUploading || isCheckingFiles ? 0.7 : 1,
              }}
            >
              <Stack spacing={1} alignItems="center" sx={{ p: 2 }}>
                <CloudUploadOutlinedIcon
                  color="primary"
                  sx={{ fontSize: 56 }}
                />

                <Typography fontWeight={800} color="primary.main">
                  {isCheckingFiles
                    ? "Verificando archivos..."
                    : "Arrastra y suelta tus archivos PDF aquí"}
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

            {isCheckingFiles && <LinearProgress sx={{ mt: 1.5 }} />}

            {queue.length > 0 && (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
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
                  disabled={isUploading || isCheckingFiles}
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

            <FormControl fullWidth sx={{ mt: 2.5 }}>
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
              La clasificación se habilitará cuando los PDF hayan sido cargados
              y se conecten los endpoints de extracción e inferencia.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: "#fafbfc",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
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

            <Tooltip title="Disponible en el siguiente ticket: extracción, normalización y clasificación.">
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowRoundedIcon />}
                  disabled={!canStartClassification}
                >
                  Iniciar clasificación
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderBottom: "1px solid #e4e9f0",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="#10275b">
                Hojas de vida del proceso
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Los archivos cargados correctamente quedan registrados como
                candidatos y fuentes PDF en el backend.
              </Typography>
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
                sx={{
                  fontSize: 56,
                  color: "text.disabled",
                }}
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
            <Table sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f6f8fb",
                  }}
                >
                  <TableCell>Archivo</TableCell>
                  <TableCell align="center">Progreso</TableCell>
                  <TableCell align="center">Estado de carga</TableCell>
                  <TableCell>Registro backend</TableCell>
                  <TableCell align="center">Clasificación</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.key} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <PictureAsPdfOutlinedIcon color="error" />

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {item.file.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(item.file.size)}
                          </Typography>

                          {item.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{
                                display: "block",
                              }}
                            >
                              {item.error}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell align="center" sx={{ minWidth: 150 }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        color={item.status === "error" ? "error" : "primary"}
                      />

                      <Typography variant="caption">
                        {item.progress}%
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {renderUploadStatus(item)}
                    </TableCell>

                    <TableCell>
                      {item.result ? (
                        <Stack spacing={0.25}>
                          <Typography variant="caption" fontWeight={700}>
                            Candidato: {item.result.candidate.id}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Fuente: {item.result.candidate_source.id}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Extracción:{" "}
                            {item.result.candidate_source.extraction_status}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Pendiente
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip label="Pendiente" size="small" disabled />
                    </TableCell>

                    <TableCell align="center">
                      <Skeleton
                        variant="rounded"
                        width={64}
                        height={28}
                        sx={{ mx: "auto" }}
                      />
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
                            disabled={isUploading || item.status === "uploaded"}
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
            value={queue.filter((item) => item.status === "error").length}
            label="Errores de carga"
            caption="Archivos que requieren reintento"
          />

          <SummaryCard
            icon={<ManageSearchOutlinedIcon />}
            value="0"
            label="Procesados"
            caption="Pendiente de extracción y normalización"
          />

          <SummaryCard
            icon={<AssessmentOutlinedIcon />}
            value="--"
            label="Mejor score"
            caption="Disponible después de la clasificación"
          />

          <SummaryCard
            icon={<QueryBuilderOutlinedIcon />}
            value="-- seg"
            label="Tiempo promedio"
            caption="Disponible después del procesamiento"
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default HomePageContent;
