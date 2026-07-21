import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const Loading = () => {
  return (
    <Box
      sx={{
        minHeight: 360,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />

        <Typography color="text.secondary">Cargando información...</Typography>
      </Stack>
    </Box>
  );
};

export default Loading;
