import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WorkIcon from "@mui/icons-material/Work";

const HomePageContent = () => {
  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bienvenido al clasificador de hojas de vida
          </Typography>

          <Typography color="text.secondary">
            Interfaz web para gestionar perfiles de puesto, cargar hojas de vida
            y revisar resultados de preselección de candidatos.
          </Typography>
        </Box>

        <Card sx={{ maxWidth: 520 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <WorkIcon color="primary" fontSize="large" />

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Gestión de perfiles
                </Typography>

                <Typography color="text.secondary">
                  Consulta los perfiles de puesto registrados en el backend.
                  Esta pantalla servirá para validar la conexión con la API.
                </Typography>
              </Box>
            </Stack>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              variant="contained"
              component={NextLink}
              href="/job-profiles"
            >
              Abrir gestión de perfiles
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Box>
  );
};

export default HomePageContent;