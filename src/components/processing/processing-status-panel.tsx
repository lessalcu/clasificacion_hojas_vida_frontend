"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { ProcessingStepStatus } from "@/services/api/types/processing";

type ProcessingStatusPanelProps = {
  isProcessing: boolean;
  progress: number;
  currentMessage: string;
  completed: boolean;
  failed: boolean;
  totalFiles: number;
  processedFiles: number;
};

const getStatusData = ({
  completed,
  failed,
  isProcessing,
}: {
  completed: boolean;
  failed: boolean;
  isProcessing: boolean;
}) => {
  if (failed) {
    return {
      label: "Proceso fallido",
      color: "error" as const,
      icon: <ErrorOutlineIcon />,
    };
  }

  if (completed) {
    return {
      label: "Proceso completado",
      color: "success" as const,
      icon: <CheckCircleOutlineIcon />,
    };
  }

  if (isProcessing) {
    return {
      label: "Procesando",
      color: "primary" as const,
      icon: <LoopOutlinedIcon />,
    };
  }

  return {
    label: "Pendiente",
    color: "default" as const,
    icon: <HourglassEmptyOutlinedIcon />,
  };
};

export const ProcessingStatusPanel = ({
  isProcessing,
  progress,
  currentMessage,
  completed,
  failed,
  totalFiles,
  processedFiles,
}: ProcessingStatusPanelProps) => {
  const status = getStatusData({
    completed,
    failed,
    isProcessing,
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderColor: failed
          ? "error.light"
          : completed
            ? "success.light"
            : "divider",
        backgroundColor: failed
          ? "rgba(211, 47, 47, 0.03)"
          : completed
            ? "rgba(46, 125, 50, 0.03)"
            : "#ffffff",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={800} color="#10275b">
              Estado del procesamiento
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {currentMessage}
            </Typography>
          </Box>

          <Chip
            icon={status.icon}
            label={status.label}
            color={status.color}
            variant={status.color === "default" ? "outlined" : "filled"}
          />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={700}>
              Progreso general
            </Typography>

            <Typography variant="body2">
              {progress}% · {processedFiles} de {totalFiles} hojas procesadas
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progress}
            color={failed ? "error" : completed ? "success" : "primary"}
            sx={{
              mt: 0.75,
              height: 9,
              borderRadius: 999,
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

type StepStatusChipProps = {
  status: ProcessingStepStatus;
};

export const StepStatusChip = ({ status }: StepStatusChipProps) => {
  if (status === "completed") {
    return <Chip label="Completado" size="small" color="success" />;
  }

  if (status === "processing") {
    return <Chip label="Procesando" size="small" color="primary" />;
  }

  if (status === "failed") {
    return <Chip label="Fallido" size="small" color="error" />;
  }

  return <Chip label="Pendiente" size="small" variant="outlined" />;
};
