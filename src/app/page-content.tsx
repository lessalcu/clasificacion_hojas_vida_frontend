"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";

import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QueryBuilderOutlinedIcon from "@mui/icons-material/QueryBuilderOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
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

import { useJobProfiles } from "@/services/api/job-profiles/use-job-profiles";

const MAX_FILES = 50;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const TOAST_DURATION = 5000;

const rankingOptions = [3, 5, 10, 20] as const;

type RankingOption = (typeof rankingOptions)[number];

type HelpTooltipProps = {
  title: string;
};

const HelpTooltip = ({ title }: HelpTooltipProps) => {
  return (
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
};

type StepTitleProps = {
  number: number;
  title: string;
  help: string;
};

const StepTitle = ({ number, title, help }: StepTitleProps) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          color: "#ffffff",
          backgroundColor: "primary.main",
          fontWeight: 800,
          fontSize: "0.9rem",
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
};

type SummaryCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  caption: string;
  help: string;
  backgroundColor: string;
  iconColor: string;
};

const SummaryCard = ({
  icon,
  value,
  label,
  caption,
  help,
  backgroundColor,
  iconColor,
}: SummaryCardProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        minWidth: 0,
        height: "100%",
        p: 2,
        borderRadius: 3,
        borderColor: "#e2e8f0",
        boxShadow: "0 4px 14px rgba(20, 44, 82, 0.03)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        <HelpTooltip title={help} />
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 2.5,
            backgroundColor,
            color: iconColor,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, pt: 0.25 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            color={iconColor}
            sx={{ lineHeight: 1 }}
          >
            {value}
          </Typography>

          <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>
            {label}
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 1.5,
          lineHeight: 1.5,
        }}
      >
        {caption}
      </Typography>
    </Paper>
  );
};

type ProcessItemProps = {
  icon: ReactNode;
  text: string;
};

const ProcessItem = ({ icon, text }: ProcessItemProps) => {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{
        flex: "1 1 170px",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          backgroundColor: "#eef5ff",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Typography variant="body2" color="#23395d" sx={{ lineHeight: 1.45 }}>
        {text}
      </Typography>
    </Stack>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileKey = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  const selectedProfile = useMemo(
    () => jobProfiles.find((profile) => profile.id === selectedProfileId),
    [jobProfiles, selectedProfileId]
  );

  /*
   * Se mantiene deshabilitado hasta integrar el endpoint
   * de clasificación.
   *
   * Luego puede cambiarse a:
   *
   * const canStartClassification =
   *   Boolean(selectedProfileId) &&
   *   selectedFiles.length > 0 &&
   *   !isProcessing;
   */
  const canStartClassification = false;

  const addFiles = (incomingFiles: File[]) => {
    const validFiles: File[] = [];
    const invalidTypeFiles: string[] = [];
    const oversizedFiles: string[] = [];

    incomingFiles.forEach((file) => {
      const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

      const isPdf = file.type === "application/pdf" || hasPdfExtension;

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
        `Solo se permiten archivos PDF. Archivos rechazados: ${invalidTypeFiles.join(
          ", "
        )}`,
        {
          autoClose: TOAST_DURATION,
        }
      );
    }

    if (oversizedFiles.length > 0) {
      toast.error(
        `Cada archivo debe pesar máximo 10 MB. Archivos rechazados: ${oversizedFiles.join(
          ", "
        )}`,
        {
          autoClose: TOAST_DURATION,
        }
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    setSelectedFiles((currentFiles) => {
      const existingKeys = new Set(currentFiles.map(getFileKey));

      const filesWithoutDuplicates = validFiles.filter(
        (file) => !existingKeys.has(getFileKey(file))
      );

      const availableSlots = MAX_FILES - currentFiles.length;

      const acceptedFiles = filesWithoutDuplicates.slice(
        0,
        Math.max(availableSlots, 0)
      );

      if (acceptedFiles.length < filesWithoutDuplicates.length) {
        toast.warning(
          `Solo se pueden cargar hasta ${MAX_FILES} hojas de vida por lote.`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      if (acceptedFiles.length > 0) {
        toast.success(
          acceptedFiles.length === 1
            ? "Hoja de vida cargada correctamente."
            : `${acceptedFiles.length} hojas de vida cargadas correctamente.`,
          {
            autoClose: TOAST_DURATION,
          }
        );
      }

      return [...currentFiles, ...acceptedFiles];
    });
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    addFiles(files);

    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const removeFile = (fileToRemove: File) => {
    const keyToRemove = getFileKey(fileToRemove);

    setSelectedFiles((currentFiles) =>
      currentFiles.filter((file) => getFileKey(file) !== keyToRemove)
    );
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const handleOpenPdf = (file: File) => {
    const objectUrl = URL.createObjectURL(file);

    const openedWindow = window.open(
      objectUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!openedWindow) {
      toast.error("El navegador bloqueó la apertura del PDF.", {
        autoClose: TOAST_DURATION,
      });
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60_000);
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
          borderColor: "#dde5ef",
          boxShadow: "0 5px 20px rgba(35, 61, 99, 0.04)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ManageSearchOutlinedIcon color="primary" sx={{ fontSize: 28 }} />

          <Typography
            variant="h5"
            fontWeight={800}
            color="#10275b"
            sx={{
              fontSize: {
                xs: "1.25rem",
                md: "1.45rem",
              },
            }}
          >
            Evaluación y clasificación de hojas de vida
          </Typography>

          <HelpTooltip title="Selecciona un perfil, carga las hojas de vida, configura el Top de resultados y genera un ranking de los candidatos con mayor afinidad." />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
            ml: {
              xs: 0,
              sm: 4.5,
            },
          }}
        >
          Compara automáticamente cada hoja de vida con los criterios del perfil
          seleccionado.
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
          borderColor: "#dde5ef",
          boxShadow: "0 5px 20px rgba(35, 61, 99, 0.04)",
        }}
      >
        {isLoadingProfiles && <LinearProgress sx={{ mb: 2 }} />}

        {isProfilesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No se pudieron consultar los perfiles.{" "}
            {profilesError instanceof Error
              ? profilesError.message
              : "Error desconocido"}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "0.95fr 1.2fr 0.75fr",
            },
            gap: {
              xs: 3,
              lg: 0,
            },
          }}
        >
          <Box
            sx={{
              pr: {
                lg: 3,
              },
            }}
          >
            <StepTitle
              number={1}
              title="Selecciona el perfil del puesto"
              help="El perfil contiene el cargo, habilidades, tecnologías, experiencia, formación e idiomas con los que se compararán las hojas de vida."
            />

            <FormControl
              fullWidth
              sx={{ mt: 2.5 }}
              disabled={isLoadingProfiles || jobProfiles.length === 0}
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
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#f7f9fc",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="primary.main"
                >
                  Perfil seleccionado
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedProfile.description}
                </Typography>
              </Box>
            )}

            {!isLoadingProfiles &&
              !isProfilesError &&
              jobProfiles.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Primero debe registrar un perfil de puesto.
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
              help="Puedes cargar uno o varios documentos PDF estándar con texto seleccionable. Cada archivo puede pesar hasta 10 MB."
            />

            <Box
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                mt: 2.5,
                minHeight: 190,
                px: 2,
                py: 3,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: isDragging ? "primary.main" : "#a9c9f5",
                borderRadius: 3,
                backgroundColor: isDragging
                  ? "rgba(25, 118, 210, 0.07)"
                  : "#fbfdff",
                transition:
                  "background-color 160ms ease, border-color 160ms ease",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              <Stack spacing={1} alignItems="center">
                <CloudUploadOutlinedIcon
                  color="primary"
                  sx={{ fontSize: 58 }}
                />

                <Typography
                  variant="body1"
                  fontWeight={800}
                  color="primary.main"
                >
                  Arrastra y suelta tus archivos PDF aquí
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  o presiona para seleccionarlos
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Hasta 50 archivos · máximo 10 MB por archivo
                </Typography>
              </Stack>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={handleFileInputChange}
            />

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Archivos seleccionados ({selectedFiles.length})
                  </Typography>

                  <Button size="small" color="error" onClick={clearFiles}>
                    Quitar todos
                  </Button>
                </Stack>

                <Stack
                  spacing={1}
                  sx={{
                    mt: 1,
                    maxHeight: 190,
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {selectedFiles.map((file) => (
                    <Paper
                      key={getFileKey(file)}
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DescriptionOutlinedIcon
                          color="error"
                          fontSize="small"
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                            flexGrow: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {file.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>

                        <Tooltip title="Quitar archivo">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeFile(file);
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              pl: {
                lg: 3,
              },
            }}
          >
            <StepTitle
              number={3}
              title="Configura el ranking"
              help="Define cuántos candidatos deseas visualizar. El sistema devolverá los mejores 3, 5, 10 o 20 según el score de afinidad."
            />

            <FormControl fullWidth sx={{ mt: 2.5 }}>
              <InputLabel id="ranking-limit-label">
                Mostrar resultados
              </InputLabel>

              <Select
                labelId="ranking-limit-label"
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

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              El ranking ordenará a los candidatos de mayor a menor según su
              score de afinidad con el perfil seleccionado.
            </Typography>

            <Chip
              label={`Ranking configurado: Top ${rankingLimit}`}
              color="primary"
              variant="outlined"
              sx={{
                mt: 2,
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            borderColor: canStartClassification ? "success.light" : "#e0e4ea",
            backgroundColor: canStartClassification
              ? "rgba(46, 125, 50, 0.04)"
              : "#fafbfc",
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
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  backgroundColor: canStartClassification
                    ? "success.main"
                    : "#e4e8ee",
                  color: canStartClassification ? "#ffffff" : "#677384",
                }}
              >
                <PlayArrowRoundedIcon />
              </Box>

              <Box>
                <Stack direction="row" alignItems="center">
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    color="#10275b"
                  >
                    Iniciar clasificación
                  </Typography>

                  <HelpTooltip title="El sistema extraerá el texto, normalizará la información, aplicará el modelo activo y generará el ranking." />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  La selección del perfil y la carga de PDF ya están
                  disponibles. La clasificación se habilitará cuando se conecte
                  el endpoint.
                </Typography>
              </Box>
            </Stack>

            <Tooltip
              title="Temporalmente deshabilitado hasta integrar el endpoint de clasificación."
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  disabled={!canStartClassification}
                  sx={{
                    minWidth: 220,
                    minHeight: 48,
                    fontWeight: 800,
                  }}
                >
                  Iniciar clasificación
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      </Paper>

      {/* RESULTADOS, CLASIFICACIÓN Y RANKING */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "#dde5ef",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(35, 61, 99, 0.04)",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 2.5,
            },
            py: 2,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e4e9f0",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AssessmentOutlinedIcon color="primary" />

                <Typography variant="h6" fontWeight={800} color="#10275b">
                  Clasificación y ranking de candidatos
                </Typography>

                <HelpTooltip title="Aquí aparecerá la posición de cada candidato, la clasificación obtenida, su score de afinidad y el PDF utilizado en la evaluación." />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Se mostrarán los mejores {rankingLimit} candidatos ordenados por
                su score de afinidad.
              </Typography>
            </Box>

            <Chip
              label={`Top ${rankingLimit}`}
              color="primary"
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Box>

        {selectedFiles.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              px: 2,
              py: 5,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              backgroundColor: "#fafbfd",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  backgroundColor: "#edf2f8",
                  color: "#8390a3",
                }}
              >
                <AssessmentOutlinedIcon sx={{ fontSize: 34 }} />
              </Box>

              <Typography variant="subtitle1" fontWeight={700}>
                Aún no existen hojas de vida para clasificar
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 520 }}
              >
                Selecciona un perfil y carga uno o varios archivos PDF. Los
                documentos aparecerán aquí mientras esperan ser procesados.
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            <Alert
              severity="info"
              sx={{
                m: 2,
                mb: 0,
              }}
            >
              Los PDF ya están adjuntos. La posición, clasificación y score
              permanecerán pendientes hasta ejecutar el modelo.
            </Alert>

            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 950,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f6f8fb",
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        width: 100,
                        fontWeight: 800,
                      }}
                    >
                      Posición
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 260,
                        fontWeight: 800,
                      }}
                    >
                      Hoja de vida
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 150,
                        fontWeight: 800,
                      }}
                    >
                      PDF adjunto
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        minWidth: 150,
                        fontWeight: 800,
                      }}
                    >
                      Clasificación
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        minWidth: 140,
                        fontWeight: 800,
                      }}
                    >
                      Score
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        minWidth: 150,
                        fontWeight: 800,
                      }}
                    >
                      Estado
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedFiles.map((file) => (
                    <TableRow key={getFileKey(file)} hover>
                      <TableCell align="center">
                        <Tooltip title="La posición se asignará al generar el ranking.">
                          <Box>
                            <Skeleton
                              variant="rounded"
                              width={44}
                              height={32}
                              sx={{ mx: "auto" }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 2,
                              backgroundColor: "#fff0f0",
                              color: "error.main",
                            }}
                          >
                            <PictureAsPdfOutlinedIcon />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {file.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<OpenInNewIcon />}
                          onClick={() => handleOpenPdf(file)}
                        >
                          Ver PDF
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Se mostrará Apto o No apto después de procesar el documento.">
                          <span>
                            <Chip label="Pendiente" size="small" disabled />
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="El score se calculará al comparar la hoja de vida con el perfil del puesto.">
                          <Box>
                            <Skeleton
                              variant="rounded"
                              width={70}
                              height={30}
                              sx={{ mx: "auto" }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label="Sin procesar"
                          size="small"
                          variant="outlined"
                          sx={{
                            color: "text.secondary",
                            borderColor: "#c7ced8",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                px: 2.5,
                py: 1.75,
                backgroundColor: "#fafbfd",
                borderTop: "1px solid #e4e9f0",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Vista previa: los documentos se muestran en el orden de carga.
                El orden definitivo será reemplazado por el ranking generado por
                el modelo.
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Box>
        <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6" fontWeight={800} color="#10275b">
            Resumen del proceso
          </Typography>

          <HelpTooltip title="Estos indicadores se actualizarán cuando el backend procese las hojas de vida y genere los resultados." />
        </Stack>

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
            value={selectedFiles.length}
            label="Hojas de vida cargadas"
            caption="Total de archivos PDF seleccionados"
            help="Cantidad de hojas de vida agregadas al lote actual."
            backgroundColor="#e8f2ff"
            iconColor="#1265ce"
          />

          <SummaryCard
            icon={<ManageSearchOutlinedIcon />}
            value="0"
            label="Candidatos procesados"
            caption="En el análisis actual"
            help="Número de candidatos procesados correctamente por el backend."
            backgroundColor="#f1ecff"
            iconColor="#6846d6"
          />

          <SummaryCard
            icon={<CheckCircleOutlineIcon />}
            value="0"
            label="Clasificaciones realizadas"
            caption="En el análisis actual"
            help="Cantidad de resultados de clasificación generados."
            backgroundColor="#e7f7ec"
            iconColor="#218a43"
          />

          <SummaryCard
            icon={<AssessmentOutlinedIcon />}
            value="--"
            label="Mejor score de afinidad"
            caption="Aún no disponible"
            help="Mayor score obtenido dentro del grupo de candidatos evaluado."
            backgroundColor="#fff1e7"
            iconColor="#d96b1b"
          />

          <SummaryCard
            icon={<QueryBuilderOutlinedIcon />}
            value="-- seg"
            label="Tiempo promedio"
            caption="Por hoja de vida"
            help="Tiempo medio requerido para procesar una hoja de vida."
            backgroundColor="#f2ecff"
            iconColor="#754ad8"
          />

          <SummaryCard
            icon={<AnalyticsOutlinedIcon />}
            value="-- %"
            label="F1-Score del modelo"
            caption="Aún no disponible"
            help="Métrica balanceada entre precisión y Recall del modelo utilizado."
            backgroundColor="#e9f8fa"
            iconColor="#078a9c"
          />
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
          borderStyle: "dashed",
          borderColor: "#9ec5f6",
          backgroundColor: "#fbfdff",
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              backgroundColor: "#eaf3ff",
              color: "primary.main",
              mr: 1.25,
            }}
          >
            <SecurityOutlinedIcon />
          </Box>

          <Typography variant="h6" fontWeight={800} color="#10275b">
            ¿Cómo funciona?
          </Typography>

          <HelpTooltip title="Este es el flujo completo que seguirá cada ejecución de clasificación." />
        </Stack>

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={1.5}
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
        >
          <ProcessItem
            icon={<WorkOutlineIcon />}
            text="Selecciona un perfil del puesto"
          />

          <ArrowForwardIcon
            color="disabled"
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },
            }}
          />

          <ProcessItem
            icon={<CloudUploadOutlinedIcon />}
            text="Carga una o varias hojas de vida en PDF"
          />

          <ArrowForwardIcon
            color="disabled"
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },
            }}
          />

          <ProcessItem
            icon={<SettingsSuggestOutlinedIcon />}
            text="El sistema extrae, depura y normaliza la información"
          />

          <ArrowForwardIcon
            color="disabled"
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },
            }}
          />

          <ProcessItem
            icon={<AnalyticsOutlinedIcon />}
            text="El modelo calcula clasificación y score de afinidad"
          />

          <ArrowForwardIcon
            color="disabled"
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },
            }}
          />

          <ProcessItem
            icon={<AssessmentOutlinedIcon />}
            text={`Obtienes un ranking configurable Top ${rankingLimit}`}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default HomePageContent;
