"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";

import {
  getCandidatePdfUrl,
  getProcessingRunResults,
  getRememberedProcessingRun,
  rememberLastProcessingRun,
} from "@/services/api/results/results-service";
import type {
  CandidateAttributeItem,
  EnrichedCandidateResult,
  ProcessingRunResultData,
} from "@/services/api/types/results";

const TOAST_DURATION = 5000;

const CARD_BORDER_COLOR = "#e2e8f0";
const PRIMARY_DARK = "#0f2f66";
const PAGE_BACKGROUND = "#f5f7fb";

const getErrorMessage = (
  error: unknown
): string => {
  return error instanceof Error
    ? error.message
    : "No se pudieron consultar los resultados.";
};

const getAttributeLabel = (
  item: CandidateAttributeItem | string
): string => {
  if (typeof item === "string") {
    return item.trim();
  }

  const name =
    item.name ??
    item.display ??
    item.canonical ??
    "";

  if (!name.trim()) {
    return "";
  }

  if (item.level) {
    return `${name} (${item.level})`;
  }

  return name;
};

const getRelevantMatches = (
  result: EnrichedCandidateResult
): string[] => {
  return Array.from(
    new Set([
      ...(result.relevant_matches.skills ?? []),
      ...(result.relevant_matches.technologies ?? []),
      ...(result.relevant_matches.languages ?? []),
    ])
  );
};

const getCandidateName = (
  result: EnrichedCandidateResult
): string => {
  return (
    result.candidate_profile?.pseudonym_code ||
    result.candidate_source?.original_filename ||
    result.candidate_profile_id
  );
};

const getCandidateInitials = (
  result: EnrichedCandidateResult
): string => {
  const value = getCandidateName(result);

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const getPositionStyle = (
  position?: number | null
) => {
  if (position === 1) {
    return {
      label: "1",
      background:
        "linear-gradient(135deg, #f5b700 0%, #ffd966 100%)",
      color: "#5f4500",
      boxShadow:
        "0 5px 14px rgba(245, 183, 0, 0.30)",
    };
  }

  if (position === 2) {
    return {
      label: "2",
      background:
        "linear-gradient(135deg, #a8b2c1 0%, #dce2ea 100%)",
      color: "#344054",
      boxShadow:
        "0 5px 14px rgba(120, 135, 155, 0.25)",
    };
  }

  if (position === 3) {
    return {
      label: "3",
      background:
        "linear-gradient(135deg, #b87333 0%, #dba36d 100%)",
      color: "#ffffff",
      boxShadow:
        "0 5px 14px rgba(184, 115, 51, 0.28)",
    };
  }

  return {
    label: position?.toString() ?? "--",
    background: "#e8f1ff",
    color: "#1267c4",
    boxShadow: "none",
  };
};

const getScoreTone = (
  score: number
) => {
  if (score >= 80) {
    return {
      color: "#16803c",
      backgroundColor: "#e9f8ef",
    };
  }

  if (score >= 60) {
    return {
      color: "#a15c00",
      backgroundColor: "#fff4df",
    };
  }

  return {
    color: "#c23b3b",
    backgroundColor: "#fff0f0",
  };
};

type AttributeChipsProps = {
  items: Array<
    CandidateAttributeItem | string
  >;
  emptyText?: string;
};

const AttributeChips = ({
  items,
  emptyText = "No identificado",
}: AttributeChipsProps) => {
  const labels = Array.from(
    new Set(
      items
        .map(getAttributeLabel)
        .filter(Boolean)
    )
  );

  if (labels.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {emptyText}
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      flexWrap="wrap"
    >
      {labels.map((label) => (
        <Chip
          key={label}
          label={label}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundColor: "#f8fafc",
            borderColor: "#d8e1eb",
            color: "#334155",
            fontWeight: 600,
          }}
        />
      ))}
    </Stack>
  );
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  accentBackground: string;
};

const SummaryCard = ({
  label,
  value,
  icon,
  accentColor,
  accentBackground,
}: SummaryCardProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 3,
        borderColor: CARD_BORDER_COLOR,
        backgroundColor: "#ffffff",
        transition:
          "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 10px 26px rgba(15, 47, 102, 0.08)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: accentBackground,
            color: accentColor,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            color={accentColor}
            lineHeight={1.1}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={700}
            sx={{
              mt: 0.5,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

type DetailSectionProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const DetailSection = ({
  icon,
  title,
  children,
}: DetailSectionProps) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: `1px solid ${CARD_BORDER_COLOR}`,
        backgroundColor: "#fbfcfe",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 1.25,
        }}
      >
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="subtitle2"
          fontWeight={900}
          color={PRIMARY_DARK}
        >
          {title}
        </Typography>
      </Stack>

      {children}
    </Box>
  );
};

const ResultsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryRunId =
    searchParams.get("runId") ?? "";

  const [
    processingRunId,
    setProcessingRunId,
  ] = useState("");

  const [
    runIdInput,
    setRunIdInput,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState<
    ProcessingRunResultData | null
  >(null);

  const [
    selectedResult,
    setSelectedResult,
  ] = useState<
    EnrichedCandidateResult | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const loadResults = useCallback(
    async (
      runId: string
    ): Promise<void> => {
      const normalizedRunId =
        runId.trim();

      if (!normalizedRunId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response =
          await getProcessingRunResults(
            normalizedRunId
          );

        setData(response);
        setProcessingRunId(
          normalizedRunId
        );
        setRunIdInput(
          normalizedRunId
        );

        rememberLastProcessingRun(
          normalizedRunId
        );
      } catch (error) {
        const message =
          getErrorMessage(error);

        setData(null);
        setLoadError(message);

        toast.error(message, {
          autoClose: TOAST_DURATION,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const initialRunId =
      queryRunId ||
      getRememberedProcessingRun();

    if (!initialRunId) {
      return;
    }

    setRunIdInput(initialRunId);

    void loadResults(initialRunId);
  }, [
    loadResults,
    queryRunId,
  ]);

  const orderedResults = useMemo(
    () => {
      return [
        ...(data?.results ?? []),
      ].sort(
        (
          first,
          second
        ) =>
          Number(
            first.rank_position ??
              9999
          ) -
          Number(
            second.rank_position ??
              9999
          )
      );
    },
    [data]
  );

  const handleSearch = () => {
    const normalizedRunId =
      runIdInput.trim();

    if (!normalizedRunId) {
      toast.error(
        "Ingresa el identificador de una ejecución.",
        {
          autoClose: TOAST_DURATION,
        }
      );

      return;
    }

    router.replace(
      `/results?runId=${encodeURIComponent(
        normalizedRunId
      )}`
    );

    void loadResults(
      normalizedRunId
    );
  };

  const handleCopyRunId = async () => {
    const value =
      processingRunId ||
      runIdInput.trim();

    if (!value) {
      toast.error(
        "No existe un identificador para copiar.",
        {
          autoClose: TOAST_DURATION,
        }
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      toast.success(
        "Identificador copiado.",
        {
          autoClose: 2500,
        }
      );
    } catch {
      toast.error(
        "No se pudo copiar el identificador.",
        {
          autoClose: TOAST_DURATION,
        }
      );
    }
  };

  const handleOpenPdf = (
    result: EnrichedCandidateResult
  ) => {
    const sourceId =
      result.candidate_source?.id;

    if (!sourceId) {
      toast.error(
        "El resultado no tiene un PDF asociado.",
        {
          autoClose: TOAST_DURATION,
        }
      );

      return;
    }

    window.open(
      getCandidatePdfUrl(
        sourceId,
        false
      ),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDownloadPdf = (
    result: EnrichedCandidateResult
  ) => {
    const sourceId =
      result.candidate_source?.id;

    if (!sourceId) {
      toast.error(
        "El resultado no tiene un PDF asociado.",
        {
          autoClose: TOAST_DURATION,
        }
      );

      return;
    }

    const anchor =
      document.createElement("a");

    anchor.href =
      getCandidatePdfUrl(
        sourceId,
        true
      );

    anchor.download =
      result.candidate_source
        ?.original_filename ??
      "hoja-de-vida.pdf";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: PAGE_BACKGROUND,
      }}
    >
      <Stack spacing={2.5}>
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            borderRadius: 4,
            borderColor: CARD_BORDER_COLOR,
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
            boxShadow:
              "0 8px 28px rgba(15, 47, 102, 0.05)",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={2.5}
            alignItems={{
              xs: "stretch",
              lg: "center",
            }}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  backgroundColor: "#e9f3ff",
                  color: "primary.main",
                }}
              >
                <AssessmentOutlinedIcon />
              </Avatar>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  color={PRIMARY_DARK}
                >
                  Resultados y ranking
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Revisa la clasificación,
                  el nivel de afinidad y
                  la información relevante
                  de cada candidato.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
            >
              <TextField
                label="ID de ejecución"
                value={runIdInput}
                onChange={(event) =>
                  setRunIdInput(
                    event.target.value
                  )
                }
                size="small"
                sx={{
                  minWidth: {
                    sm: 345,
                  },
                  "& .MuiOutlinedInput-root":
                    {
                      borderRadius: 2.5,
                      backgroundColor:
                        "#ffffff",
                    },
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <PersonSearchOutlinedIcon />
                  )
                }
                onClick={handleSearch}
                disabled={isLoading}
                sx={{
                  minHeight: 40,
                  px: 2.5,
                  borderRadius: 2.5,
                  fontWeight: 800,
                }}
              >
                Consultar
              </Button>

              <Tooltip title="Copiar identificador">
                <span>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      void handleCopyRunId()
                    }
                    disabled={
                      !processingRunId &&
                      !runIdInput.trim()
                    }
                    sx={{
                      border:
                        "1px solid #d8e3ef",
                      backgroundColor:
                        "#ffffff",
                    }}
                  >
                    <ContentCopyOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Actualizar resultados">
                <span>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      void loadResults(
                        processingRunId
                      )
                    }
                    disabled={
                      isLoading ||
                      !processingRunId
                    }
                    sx={{
                      border:
                        "1px solid #d8e3ef",
                      backgroundColor:
                        "#ffffff",
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {isLoading && (
          <LinearProgress
            sx={{
              borderRadius: 10,
              height: 5,
            }}
          />
        )}

        {loadError && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
            }}
          >
            {loadError}
          </Alert>
        )}

        {!isLoading &&
          !loadError &&
          !data && (
            <Paper
              variant="outlined"
              sx={{
                py: 7,
                px: 3,
                borderRadius: 4,
                borderColor:
                  CARD_BORDER_COLOR,
                textAlign: "center",
                backgroundColor:
                  "#ffffff",
              }}
            >
              <Avatar
                sx={{
                  width: 68,
                  height: 68,
                  mx: "auto",
                  mb: 2,
                  backgroundColor:
                    "#eaf3ff",
                  color: "primary.main",
                }}
              >
                <PersonSearchOutlinedIcon
                  fontSize="large"
                />
              </Avatar>

              <Typography
                variant="h6"
                fontWeight={900}
                color={PRIMARY_DARK}
              >
                Aún no hay resultados para mostrar
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  maxWidth: 540,
                  mx: "auto",
                }}
              >
                Ejecuta una clasificación
                desde Inicio o ingresa
                el identificador de una
                ejecución ya procesada.
              </Typography>
            </Paper>
          )}

        {data && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: (
                    "repeat(2, minmax(0, 1fr))"
                  ),
                  xl: (
                    "repeat(4, minmax(0, 1fr))"
                  ),
                },
                gap: 1.5,
              }}
            >
              <SummaryCard
                label="Candidatos evaluados"
                value={data.total_results}
                icon={<PersonOutlineIcon />}
                accentColor="#1267c4"
                accentBackground="#eaf3ff"
              />

              <SummaryCard
                label="Clasificados como aptos"
                value={
                  data.summary
                    .recommended_count
                }
                icon={
                  <EmojiEventsOutlinedIcon />
                }
                accentColor="#18864b"
                accentBackground="#eaf8f0"
              />

              <SummaryCard
                label="Mejor score"
                value={data.summary
                  .max_score_0_100
                  .toFixed(2)}
                icon={
                  <AssessmentOutlinedIcon />
                }
                accentColor="#7a4bc3"
                accentBackground="#f1ebfc"
              />

              <SummaryCard
                label="Score promedio"
                value={data.summary
                  .average_score_0_100
                  .toFixed(2)}
                icon={
                  <TerminalOutlinedIcon />
                }
                accentColor="#a15c00"
                accentBackground="#fff4df"
              />
            </Box>

            <Alert
              severity="success"
              sx={{
                borderRadius: 3,
                alignItems: "center",
              }}
            >
              Resultados cargados para{" "}
              <strong>
                {
                  data.job_profile
                    ?.title ??
                  "el perfil seleccionado"
                }
              </strong>
              .
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                borderColor:
                  CARD_BORDER_COLOR,
                backgroundColor:
                  "#ffffff",
                boxShadow:
                  "0 8px 28px rgba(15, 47, 102, 0.05)",
              }}
            >
              <Box
                sx={{
                  p: {
                    xs: 2,
                    md: 2.75,
                  },
                  borderBottom:
                    "1px solid #e7edf4",
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  justifyContent:
                    "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    color={PRIMARY_DARK}
                  >
                    Ranking de candidatos
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Ordenado de mayor a
                    menor score de afinidad.
                  </Typography>
                </Box>

                <Chip
                  label={`${data.total_results} candidato${
                    data.total_results === 1
                      ? ""
                      : "s"
                  }`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    alignSelf: {
                      xs: "flex-start",
                      sm: "center",
                    },
                    fontWeight: 800,
                  }}
                />
              </Box>

              {orderedResults.length ===
              0 ? (
                <Box sx={{ p: 4 }}>
                  <Alert severity="warning">
                    La ejecución no contiene
                    resultados.
                  </Alert>
                </Box>
              ) : (
                <TableContainer
                  sx={{
                    overflowX: "auto",
                  }}
                >
                  <Table
                    sx={{
                      minWidth: 1180,
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor:
                            "#f6f8fb",
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                          }}
                        >
                          Posición
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                          }}
                        >
                          Candidato
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                          }}
                        >
                          Coincidencias
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                          }}
                        >
                          Clasificación
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                            minWidth: 190,
                          }}
                        >
                          Afinidad
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 900,
                            color:
                              PRIMARY_DARK,
                          }}
                        >
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {orderedResults.map(
                        (result) => {
                          const matches =
                            getRelevantMatches(
                              result
                            );

                          const positionStyle =
                            getPositionStyle(
                              result.rank_position
                            );

                          const scoreTone =
                            getScoreTone(
                              result.score_0_100
                            );

                          return (
                            <TableRow
                              key={
                                result
                                  .classification_result_id ??
                                result
                                  .candidate_profile_id
                              }
                              hover
                              sx={{
                                "&:last-child td":
                                  {
                                    borderBottom:
                                      0,
                                  },
                              }}
                            >
                              <TableCell
                                align="center"
                              >
                                <Avatar
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    mx: "auto",
                                    background:
                                      positionStyle.background,
                                    color:
                                      positionStyle.color,
                                    boxShadow:
                                      positionStyle.boxShadow,
                                    fontWeight: 900,
                                    fontSize: 15,
                                  }}
                                >
                                  {result.rank_position &&
                                  result.rank_position <=
                                    3 ? (
                                    <Stack
                                      direction="row"
                                      spacing={0.25}
                                      alignItems="center"
                                    >
                                      <EmojiEventsOutlinedIcon
                                        sx={{
                                          fontSize: 17,
                                        }}
                                      />
                                      <span>
                                        {
                                          positionStyle.label
                                        }
                                      </span>
                                    </Stack>
                                  ) : (
                                    `#${
                                      positionStyle.label
                                    }`
                                  )}
                                </Avatar>
                              </TableCell>

                              <TableCell>
                                <Stack
                                  direction="row"
                                  spacing={1.25}
                                  alignItems="center"
                                >
                                  <Avatar
                                    sx={{
                                      width: 42,
                                      height: 42,
                                      backgroundColor:
                                        "#eaf3ff",
                                      color:
                                        "primary.main",
                                      fontWeight: 900,
                                      fontSize: 14,
                                    }}
                                  >
                                    {getCandidateInitials(
                                      result
                                    )}
                                  </Avatar>

                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={900}
                                      color={
                                        PRIMARY_DARK
                                      }
                                    >
                                      {getCandidateName(
                                        result
                                      )}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display:
                                          "block",
                                        mt: 0.25,
                                        maxWidth: 310,
                                        overflow:
                                          "hidden",
                                        textOverflow:
                                          "ellipsis",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {result
                                        .candidate_source
                                        ?.original_filename ??
                                        "Archivo no disponible"}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>

                              <TableCell>
                                {matches.length >
                                0 ? (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    useFlexGap
                                    flexWrap="wrap"
                                  >
                                    {matches
                                      .slice(0, 5)
                                      .map(
                                        (
                                          match
                                        ) => (
                                          <Chip
                                            key={
                                              match
                                            }
                                            label={
                                              match
                                            }
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              borderRadius: 2,
                                              backgroundColor:
                                                "#f8fafc",
                                              borderColor:
                                                "#d8e1eb",
                                            }}
                                          />
                                        )
                                      )}

                                    {matches.length >
                                      5 && (
                                      <Chip
                                        label={`+${
                                          matches.length -
                                          5
                                        }`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Sin coincidencias
                                    directas
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell
                                align="center"
                              >
                                <Chip
                                  label={
                                    result
                                      .predicted_label
                                      ? "Apto"
                                      : "No apto"
                                  }
                                  sx={{
                                    minWidth: 86,
                                    fontWeight: 800,
                                    backgroundColor:
                                      result.predicted_label
                                        ? "#e9f8ef"
                                        : "#fff0f0",
                                    color:
                                      result.predicted_label
                                        ? "#16803c"
                                        : "#c23b3b",
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Stack
                                  spacing={0.75}
                                >
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={900}
                                      color={
                                        scoreTone.color
                                      }
                                    >
                                      {result
                                        .score_0_100
                                        .toFixed(
                                          2
                                        )}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      / 100
                                    </Typography>
                                  </Stack>

                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(
                                      Math.max(
                                        result.score_0_100,
                                        0
                                      ),
                                      100
                                    )}
                                    sx={{
                                      height: 7,
                                      borderRadius:
                                        10,
                                      backgroundColor:
                                        "#edf1f5",
                                      "& .MuiLinearProgress-bar":
                                        {
                                          borderRadius:
                                            10,
                                          backgroundColor:
                                            scoreTone.color,
                                        },
                                    }}
                                  />
                                </Stack>
                              </TableCell>

                              <TableCell
                                align="right"
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="flex-end"
                                  spacing={0.5}
                                >
                                  <Tooltip title="Ver detalle">
                                    <IconButton
                                      color="primary"
                                      onClick={() =>
                                        setSelectedResult(
                                          result
                                        )
                                      }
                                      sx={{
                                        backgroundColor:
                                          "#eef5ff",
                                        "&:hover":
                                          {
                                            backgroundColor:
                                              "#dcecff",
                                          },
                                      }}
                                    >
                                      <VisibilityOutlinedIcon />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Abrir PDF">
                                    <span>
                                      <IconButton
                                        color="primary"
                                        onClick={() =>
                                          handleOpenPdf(
                                            result
                                          )
                                        }
                                        disabled={
                                          !result
                                            .candidate_source
                                            ?.id
                                        }
                                        sx={{
                                          backgroundColor:
                                            "#eef5ff",
                                          "&:hover":
                                            {
                                              backgroundColor:
                                                "#dcecff",
                                            },
                                        }}
                                      >
                                        <OpenInNewIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Descargar PDF">
                                    <span>
                                      <IconButton
                                        color="success"
                                        onClick={() =>
                                          handleDownloadPdf(
                                            result
                                          )
                                        }
                                        disabled={
                                          !result
                                            .candidate_source
                                            ?.id
                                        }
                                        sx={{
                                          backgroundColor:
                                            "#ecf8f0",
                                          "&:hover":
                                            {
                                              backgroundColor:
                                                "#d9f1e2",
                                            },
                                        }}
                                      >
                                        <DownloadOutlinedIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}

        <Dialog
          open={Boolean(
            selectedResult
          )}
          onClose={() =>
            setSelectedResult(null)
          }
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              px: 3,
              py: 2.5,
              background:
                "linear-gradient(135deg, #0f4f9d 0%, #1676d2 100%)",
              color: "#ffffff",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Avatar
                sx={{
                  backgroundColor:
                    "rgba(255,255,255,0.16)",
                  color: "#ffffff",
                }}
              >
                <PersonOutlineIcon />
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  Detalle del candidato
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.88,
                  }}
                >
                  Información normalizada
                  y resultado de clasificación
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>

          <DialogContent
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              backgroundColor:
                "#f7f9fc",
            }}
          >
            {selectedResult && (
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: (
                        "repeat(3, minmax(0, 1fr))"
                      ),
                    },
                    gap: 1.25,
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor:
                        CARD_BORDER_COLOR,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Posición
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color={
                        PRIMARY_DARK
                      }
                    >
                      #
                      {
                        selectedResult
                          .rank_position ??
                        "--"
                      }
                    </Typography>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor:
                        CARD_BORDER_COLOR,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Clasificación
                    </Typography>

                    <Box
                      sx={{
                        mt: 0.75,
                      }}
                    >
                      <Chip
                        label={
                          selectedResult
                            .predicted_label
                            ? "Apto"
                            : "No apto"
                        }
                        sx={{
                          fontWeight: 900,
                          backgroundColor:
                            selectedResult
                              .predicted_label
                              ? "#e9f8ef"
                              : "#fff0f0",
                          color:
                            selectedResult
                              .predicted_label
                              ? "#16803c"
                              : "#c23b3b",
                        }}
                      />
                    </Box>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor:
                        CARD_BORDER_COLOR,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Score de afinidad
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {selectedResult
                        .score_0_100
                        .toFixed(2)}
                    </Typography>
                  </Paper>
                </Box>

                <DetailSection
                  icon={
                    <InsertDriveFileOutlinedIcon />
                  }
                  title="Archivo"
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="#334155"
                  >
                    {selectedResult
                      .candidate_source
                      ?.original_filename ??
                      "No disponible"}
                  </Typography>
                </DetailSection>

                <DetailSection
                  icon={
                    <EmojiEventsOutlinedIcon />
                  }
                  title="Coincidencias relevantes"
                >
                  <AttributeChips
                    items={getRelevantMatches(
                      selectedResult
                    )}
                    emptyText="No se encontraron coincidencias directas."
                  />
                </DetailSection>

                <DetailSection
                  icon={
                    <PersonSearchOutlinedIcon />
                  }
                  title="Habilidades identificadas"
                >
                  <AttributeChips
                    items={
                      selectedResult
                        .candidate_profile
                        ?.skills ?? []
                    }
                  />
                </DetailSection>

                <DetailSection
                  icon={
                    <TerminalOutlinedIcon />
                  }
                  title="Tecnologías"
                >
                  <AttributeChips
                    items={
                      selectedResult
                        .candidate_profile
                        ?.technologies ?? []
                    }
                  />
                </DetailSection>

                <DetailSection
                  icon={
                    <WorkOutlineIcon />
                  }
                  title="Experiencia"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace:
                        "pre-wrap",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedResult
                      .candidate_profile
                      ?.experience_summary ||
                      "No identificada"}
                  </Typography>
                </DetailSection>

                <DetailSection
                  icon={
                    <SchoolOutlinedIcon />
                  }
                  title="Formación académica"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace:
                        "pre-wrap",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedResult
                      .candidate_profile
                      ?.education_summary ||
                      "No identificada"}
                  </Typography>
                </DetailSection>

                <DetailSection
                  icon={
                    <LanguageOutlinedIcon />
                  }
                  title="Idiomas"
                >
                  <AttributeChips
                    items={
                      selectedResult
                        .candidate_profile
                        ?.languages ?? []
                    }
                  />
                </DetailSection>
              </Stack>
            )}
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              backgroundColor:
                "#ffffff",
              gap: 0.75,
            }}
          >
            <Button
              onClick={() => {
                if (selectedResult) {
                  handleOpenPdf(
                    selectedResult
                  );
                }
              }}
              startIcon={
                <OpenInNewIcon />
              }
              disabled={
                !selectedResult
                  ?.candidate_source?.id
              }
              sx={{
                fontWeight: 800,
              }}
            >
              Ver PDF
            </Button>

            <Button
              onClick={() => {
                if (selectedResult) {
                  handleDownloadPdf(
                    selectedResult
                  );
                }
              }}
              startIcon={
                <DownloadOutlinedIcon />
              }
              disabled={
                !selectedResult
                  ?.candidate_source?.id
              }
              sx={{
                fontWeight: 800,
              }}
            >
              Descargar PDF
            </Button>

            <Button
              variant="contained"
              onClick={() =>
                setSelectedResult(null)
              }
              sx={{
                px: 3,
                borderRadius: 2.5,
                fontWeight: 900,
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
};

export default ResultsPageContent;