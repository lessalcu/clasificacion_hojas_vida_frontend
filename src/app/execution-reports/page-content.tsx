"use client";

import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";

import { getExecutionTrace } from "@/services/api/reports/report-service";
import {
  getRememberedProcessingRun,
  rememberLastProcessingRun,
} from "@/services/api/results/results-service";
import type {
  ExecutionTraceData,
  ModelBenchmarkItem,
} from "@/services/api/types/reports";

const TOAST_DURATION = 5000;
const PRIMARY_DARK = "#10275b";
const CARD_BORDER = "#e1e7ef";

const getErrorMessage = (
  error: unknown
): string => {
  return error instanceof Error
    ? error.message
    : "No se pudo consultar la trazabilidad.";
};

const formatDateTime = (
  value?: string | null
): string => {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      dateStyle: "medium",
      timeStyle: "medium",
    }
  ).format(date);
};

const formatDuration = (
  startedAt?: string | null,
  finishedAt?: string | null
): string => {
  if (!startedAt || !finishedAt) {
    return "No disponible";
  }

  const start = new Date(startedAt);
  const finish = new Date(finishedAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(finish.getTime())
  ) {
    return "No disponible";
  }

  const durationMs =
    finish.getTime() - start.getTime();

  if (durationMs < 0) {
    return "No disponible";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const totalSeconds = Math.round(
    durationMs / 1000
  );

  if (totalSeconds < 60) {
    return `${totalSeconds} s`;
  }

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds = totalSeconds % 60;

  return `${minutes} min ${seconds} s`;
};

const formatAlgorithm = (
  value?: string | null
): string => {
  if (!value) {
    return "No disponible";
  }

  const labels: Record<string, string> = {
    knn: "K-Nearest Neighbors",
    decision_tree: "Árbol de decisión",
  };

  return (
    labels[value.toLowerCase()] ??
    value
  );
};

const formatInputType = (
  value?: string | null
): string => {
  if (!value) {
    return "No disponible";
  }

  const labels: Record<string, string> = {
    batch: "Clasificación por lote",
    rank_all: "Ranking general",
    single: "Clasificación individual",
  };

  return labels[value] ?? value;
};

const getStatusConfig = (
  status?: string | null
) => {
  const normalizedStatus =
    status?.toLowerCase() ?? "";

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "success"
  ) {
    return {
      label: "Completada",
      color: "#1c7c45",
      backgroundColor: "#e8f7ef",
    };
  }

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "error"
  ) {
    return {
      label: "Fallida",
      color: "#b42318",
      backgroundColor: "#fdecec",
    };
  }

  if (
    normalizedStatus === "processing" ||
    normalizedStatus === "running"
  ) {
    return {
      label: "En proceso",
      color: "#9a6700",
      backgroundColor: "#fff3d6",
    };
  }

  return {
    label: status || "Desconocido",
    color: "#475467",
    backgroundColor: "#f2f4f7",
  };
};

const getSelectedBenchmarkModel = (
  trace: ExecutionTraceData
): ModelBenchmarkItem | null => {
  return (
    trace.model_benchmark.models.find(
      (model) => model.is_selected
    ) ?? null
  );
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  backgroundColor: string;
};

const SummaryCard = ({
  title,
  value,
  icon,
  color,
  backgroundColor,
}: SummaryCardProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: CARD_BORDER,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
      >
        <Avatar
          sx={{
            backgroundColor,
            color,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            color={color}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={700}
          >
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

type DetailItemProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

const DetailItem = ({
  label,
  value,
  icon,
}: DetailItemProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: CARD_BORDER,
        minHeight: 112,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 1,
        }}
      >
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body1"
        fontWeight={800}
        color={PRIMARY_DARK}
      >
        {value}
      </Typography>
    </Paper>
  );
};

const ModelComparisonCard = ({
  model,
}: {
  model: ModelBenchmarkItem;
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: model.is_selected
          ? "#5ca7e8"
          : CARD_BORDER,
        backgroundColor: model.is_selected
          ? "#f3f9ff"
          : "#ffffff",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        justifyContent="space-between"
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
          >
            <Typography
              variant="subtitle1"
              fontWeight={900}
              color={PRIMARY_DARK}
            >
              {formatAlgorithm(
                model.algorithm
              )}
            </Typography>

            {model.is_selected && (
              <Chip
                label="Modelo seleccionado"
                size="small"
                color="primary"
                sx={{
                  fontWeight: 800,
                }}
              />
            )}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            {model.selection_comment ||
              "Sin comentario de selección."}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={2.5}
          useFlexGap
          flexWrap="wrap"
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Recall
            </Typography>

            <Typography fontWeight={900}>
              {(model.recall ?? 0).toFixed(4)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              F1-Score
            </Typography>

            <Typography fontWeight={900}>
              {(model.f1_score ?? 0).toFixed(4)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Duración
            </Typography>

            <Typography fontWeight={900}>
              {model.duration_ms ?? 0} ms
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ExecutionReportsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryRunId =
    searchParams.get("runId") ?? "";

  const initialRequestRef = useRef<
    string | null
  >(null);

  const activeRequestRef = useRef<
    string | null
  >(null);

  const [
    processingRunId,
    setProcessingRunId,
  ] = useState("");

  const [
    runIdInput,
    setRunIdInput,
  ] = useState("");

  const [
    trace,
    setTrace,
  ] = useState<
    ExecutionTraceData | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const loadTrace = useCallback(
    async (
      runId: string
    ): Promise<void> => {
      const normalizedRunId =
        runId.trim();

      if (!normalizedRunId) {
        setTrace(null);
        return;
      }

      if (
        activeRequestRef.current ===
        normalizedRunId
      ) {
        return;
      }

      activeRequestRef.current =
        normalizedRunId;

      setIsLoading(true);
      setLoadError("");

      try {
        const response =
          await getExecutionTrace(
            normalizedRunId
          );

        setTrace(response);
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

        setTrace(null);
        setLoadError(message);

        toast.error(message, {
          autoClose: TOAST_DURATION,
        });
      } finally {
        activeRequestRef.current =
          null;

        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const initialRunId = (
      queryRunId ||
      getRememberedProcessingRun()
    ).trim();

    if (!initialRunId) {
      return;
    }

    if (
      initialRequestRef.current ===
      initialRunId
    ) {
      return;
    }

    initialRequestRef.current =
      initialRunId;

    setRunIdInput(initialRunId);

    void loadTrace(initialRunId);
  }, [
    loadTrace,
    queryRunId,
  ]);

  const duration = useMemo(
    () =>
      formatDuration(
        trace?.summary.started_at,
        trace?.summary.finished_at
      ),
    [
      trace?.summary.started_at,
      trace?.summary.finished_at,
    ]
  );

  const statusConfig = useMemo(
    () =>
      getStatusConfig(
        trace?.summary.execution_status
      ),
    [trace?.summary.execution_status]
  );

  const selectedBenchmarkModel =
    useMemo(
      () =>
        trace
          ? getSelectedBenchmarkModel(
              trace
            )
          : null,
      [trace]
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
      `/execution-reports?runId=${encodeURIComponent(
        normalizedRunId
      )}`
    );

    void loadTrace(normalizedRunId);
  };

  const handleCopyRunId = async () => {
    const value = (
      processingRunId ||
      runIdInput
    ).trim();

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

  return (
    <Stack spacing={2.5}>
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          borderRadius: 4,
          borderColor: CARD_BORDER,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                backgroundColor: "#e9f3ff",
                color: "primary.main",
              }}
            >
              <ManageSearchOutlinedIcon />
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                color={PRIMARY_DARK}
              >
                Trazabilidad de la ejecución
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Consulta los datos utilizados
                durante la clasificación y el
                modelo aplicado.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
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
                  sm: 350,
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
                  <ManageSearchOutlinedIcon />
                )
              }
              onClick={handleSearch}
              disabled={isLoading}
              sx={{
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
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Actualizar trazabilidad">
              <span>
                <IconButton
                  color="primary"
                  onClick={() =>
                    void loadTrace(
                      processingRunId
                    )
                  }
                  disabled={
                    isLoading ||
                    !processingRunId
                  }
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
        !trace && (
          <Paper
            variant="outlined"
            sx={{
              py: 7,
              px: 3,
              borderRadius: 4,
              textAlign: "center",
              borderColor: CARD_BORDER,
            }}
          >
            <Avatar
              sx={{
                width: 68,
                height: 68,
                mx: "auto",
                mb: 2,
                backgroundColor: "#e9f3ff",
                color: "primary.main",
              }}
            >
              <ManageSearchOutlinedIcon
                fontSize="large"
              />
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={900}
              color={PRIMARY_DARK}
            >
              Aún no hay una ejecución seleccionada
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              Ejecuta una clasificación o ingresa
              manualmente un identificador.
            </Typography>
          </Paper>
        )}

      {trace && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            <SummaryCard
              title="Candidatos procesados"
              value={
                trace.summary.total_candidates
              }
              icon={
                <PeopleAltOutlinedIcon />
              }
              color="#1267c4"
              backgroundColor="#eaf3ff"
            />

            <SummaryCard
              title="Procesados correctamente"
              value={
                trace.summary
                  .successful_candidates
              }
              icon={
                <CheckCircleOutlineIcon />
              }
              color="#16803c"
              backgroundColor="#e9f8ef"
            />

            <SummaryCard
              title="Candidatos fallidos"
              value={
                trace.summary
                  .failed_candidates
              }
              icon={<ErrorOutlineIcon />}
              color="#b42318"
              backgroundColor="#fdecec"
            />

            <SummaryCard
              title="Duración de la ejecución"
              value={duration}
              icon={
                <AccessTimeOutlinedIcon />
              }
              color="#7a4bc3"
              backgroundColor="#f2ebfc"
            />
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 4,
              borderColor: CARD_BORDER,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  color={PRIMARY_DARK}
                >
                  Resumen de la corrida
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Información principal registrada
                  durante la ejecución.
                </Typography>
              </Box>

              <Chip
                label={statusConfig.label}
                sx={{
                  px: 1,
                  fontWeight: 900,
                  color: statusConfig.color,
                  backgroundColor:
                    statusConfig.backgroundColor,
                }}
              />
            </Stack>

            <Divider
              sx={{
                my: 2.5,
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <DetailItem
                label="Fecha y hora de inicio"
                value={formatDateTime(
                  trace.summary.started_at
                )}
                icon={<EventOutlinedIcon />}
              />

              <DetailItem
                label="Fecha y hora de finalización"
                value={formatDateTime(
                  trace.summary.finished_at
                )}
                icon={<EventOutlinedIcon />}
              />

              <DetailItem
                label="Perfil evaluado"
                value={
                  trace.summary
                    .job_profile_title ||
                  "No disponible"
                }
                icon={<WorkOutlineIcon />}
              />

              <DetailItem
                label="Modelo utilizado"
                value={formatAlgorithm(
                  trace.summary
                    .model_algorithm
                )}
                icon={<MemoryOutlinedIcon />}
              />

              <DetailItem
                label="Versión del modelo"
                value={
                  trace.summary
                    .model_version_tag ||
                  "No disponible"
                }
                icon={
                  <AssessmentOutlinedIcon />
                }
              />

              <DetailItem
                label="Tipo de ejecución"
                value={formatInputType(
                  trace.summary.input_type
                )}
                icon={
                  <ManageSearchOutlinedIcon />
                }
              />
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 4,
              borderColor: CARD_BORDER,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={900}
              color={PRIMARY_DARK}
            >
              Resumen de afinidad
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              Distribución de los scores obtenidos
              durante la corrida.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <DetailItem
                label="Score máximo"
                value={trace.summary
                  .max_score_0_100
                  .toFixed(2)}
                icon={
                  <AssessmentOutlinedIcon />
                }
              />

              <DetailItem
                label="Score promedio"
                value={trace.summary
                  .average_score_0_100
                  .toFixed(2)}
                icon={
                  <AssessmentOutlinedIcon />
                }
              />

              <DetailItem
                label="Score mínimo"
                value={trace.summary
                  .min_score_0_100
                  .toFixed(2)}
                icon={
                  <AssessmentOutlinedIcon />
                }
              />
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 4,
              borderColor: CARD_BORDER,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={900}
              color={PRIMARY_DARK}
            >
              Selección del modelo
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {trace.summary
                .model_selection
                ?.selection_criteria ||
                "No existe un criterio registrado."}
            </Typography>

            {selectedBenchmarkModel && (
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  alignItems: "flex-start",
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={900}
                      color="#0b4f7a"
                    >
                      Modelo seleccionado automáticamente
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        lineHeight: 1.6,
                      }}
                    >
                      La selección prioriza el mayor
                      Recall promedio, luego el mayor
                      F1-Score, la menor desviación
                      estándar del F1-Score y,
                      finalmente, la menor duración.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip
                      label={`Modelo: ${formatAlgorithm(
                        selectedBenchmarkModel.algorithm
                      )}`}
                      size="small"
                      color="primary"
                      sx={{
                        fontWeight: 800,
                      }}
                    />

                    <Chip
                      label={`Recall: ${(
                        selectedBenchmarkModel.recall ??
                        0
                      ).toFixed(4)}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                      }}
                    />

                    <Chip
                      label={`F1-Score: ${(
                        selectedBenchmarkModel.f1_score ??
                        0
                      ).toFixed(4)}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                      }}
                    />

                    <Chip
                      label={`Duración: ${
                        selectedBenchmarkModel.duration_ms ??
                        0
                      } ms`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                      }}
                    />
                  </Stack>
                </Stack>
              </Alert>
            )}

            <Stack
              spacing={1.5}
              sx={{
                mt: 2,
              }}
            >
              {trace.model_benchmark.models
                .length > 0 ? (
                trace.model_benchmark.models.map(
                  (model) => (
                    <ModelComparisonCard
                      key={
                        model.model_version_id ??
                        model.algorithm ??
                        "unknown-model"
                      }
                      model={model}
                    />
                  )
                )
              ) : (
                <Alert severity="warning">
                  No existen modelos adicionales
                  para comparar.
                </Alert>
              )}
            </Stack>
          </Paper>

          {trace.summary.error_message && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 3,
              }}
            >
              <strong>
                Error registrado:
              </strong>{" "}
              {trace.summary.error_message}
            </Alert>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="right"
          >
            Trazabilidad generada el{" "}
            {formatDateTime(
              trace.generated_at
            )}
          </Typography>
        </>
      )}
    </Stack>
  );
};

export default ExecutionReportsPageContent;