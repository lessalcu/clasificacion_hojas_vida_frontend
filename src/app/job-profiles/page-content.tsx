"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  useCreateJobProfile,
  useDeleteJobProfile,
  useJobProfiles,
  useUpdateJobProfile,
} from "@/services/api/job-profiles/use-job-profiles";
import type {
  JobProfile,
  JobProfilePayload,
} from "@/services/api/types/job-profile";

type JobProfileFormValues = {
  title: string;
  description: string;
  requiredSkills: string;
  technologies: string;
  experienceRequirement: string;
  educationRequirement: string;
  languages: string;
};

const initialFormValues: JobProfileFormValues = {
  title: "",
  description: "",
  requiredSkills: "",
  technologies: "",
  experienceRequirement: "",
  educationRequirement: "",
  languages: "",
};

const parseCommaSeparatedValues = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const joinValues = (values?: string[]) => {
  return values?.join(", ") ?? "";
};

const normalizeTextValue = (value: string) => {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const buildPayload = (values: JobProfileFormValues): JobProfilePayload => {
  return {
    created_by: null,
    title: values.title.trim(),
    description: normalizeTextValue(values.description),
    required_skills: parseCommaSeparatedValues(values.requiredSkills),
    technologies: parseCommaSeparatedValues(values.technologies),
    experience_requirement: normalizeTextValue(values.experienceRequirement),
    education_requirement: normalizeTextValue(values.educationRequirement),
    languages: parseCommaSeparatedValues(values.languages),
  };
};

const buildFormValuesFromProfile = (
  profile: JobProfile
): JobProfileFormValues => {
  return {
    title: profile.title ?? "",
    description: profile.description ?? "",
    requiredSkills: joinValues(profile.required_skills),
    technologies: joinValues(profile.technologies),
    experienceRequirement: profile.experience_requirement ?? "",
    educationRequirement: profile.education_requirement ?? "",
    languages: joinValues(profile.languages),
  };
};

const renderChips = (items?: string[]) => {
  if (!items?.length) {
    return <Typography color="text.secondary">-</Typography>;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.slice(0, 4).map((item) => (
        <Chip key={item} label={item} size="small" />
      ))}

      {items.length > 4 && <Chip label={`+${items.length - 4}`} size="small" />}
    </Stack>
  );
};

const JobProfilesPageContent = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useJobProfiles();

  const createJobProfileMutation = useCreateJobProfile();
  const updateJobProfileMutation = useUpdateJobProfile();
  const deleteJobProfileMutation = useDeleteJobProfile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(
    null
  );
  const [formValues, setFormValues] =
    useState<JobProfileFormValues>(initialFormValues);

  const jobProfiles = data ?? [];
  const isSaving =
    createJobProfileMutation.isPending || updateJobProfileMutation.isPending;
  const isDeleting = deleteJobProfileMutation.isPending;
  const isEditMode = Boolean(selectedProfile);

  const handleOpenCreateDialog = () => {
    setSelectedProfile(null);
    setFormValues(initialFormValues);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (profile: JobProfile) => {
    setSelectedProfile(profile);
    setFormValues(buildFormValuesFromProfile(profile));
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedProfile(null);
    setFormValues(initialFormValues);
  };

  const handleChangeValue = (
    field: keyof JobProfileFormValues,
    value: string
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formValues.title.trim()) {
      toast.error("El título del perfil es obligatorio.");
      return;
    }

    const payload = buildPayload(formValues);

    try {
      if (selectedProfile) {
        await updateJobProfileMutation.mutateAsync({
          id: selectedProfile.id,
          payload,
        });

        toast.success("Perfil actualizado correctamente.");
      } else {
        await createJobProfileMutation.mutateAsync(payload);

        toast.success("Perfil creado correctamente.");
      }

      handleCloseDialog();
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo guardar el perfil."
      );
    }
  };

  const handleDelete = async (profile: JobProfile) => {
    const shouldDelete = window.confirm(
      `¿Seguro que deseas eliminar el perfil "${profile.title}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteJobProfileMutation.mutateAsync(profile.id);
      toast.success("Perfil eliminado correctamente.");
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el perfil."
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Gestión de perfiles
        </Typography>

        <Typography color="text.secondary">
          Administración de perfiles de puesto registrados en el backend.
        </Typography>
      </Box>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Crear perfil
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Consultar perfiles
        </Button>
      </Stack>

      {(isLoading || isFetching || isSaving || isDeleting) && (
        <LinearProgress />
      )}

      {isError && (
        <Alert severity="error">
          No se pudo consultar el backend.{" "}
          {error instanceof Error ? error.message : "Error desconocido"}
        </Alert>
      )}

      {!isLoading && !isError && jobProfiles.length === 0 && (
        <Alert severity="info">
          No existen perfiles registrados o el backend devolvió una lista vacía.
        </Alert>
      )}

      {jobProfiles.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Habilidades requeridas</TableCell>
                <TableCell>Tecnologías</TableCell>
                <TableCell>Idiomas</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {jobProfiles.map((profile) => (
                <TableRow key={profile.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{profile.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.id}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {profile.description || (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>

                  <TableCell>{renderChips(profile.required_skills)}</TableCell>

                  <TableCell>{renderChips(profile.technologies)}</TableCell>

                  <TableCell>{renderChips(profile.languages)}</TableCell>

                  <TableCell align="right">
                    <Tooltip title="Editar perfil">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(profile)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar perfil">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(profile)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditMode ? "Editar perfil" : "Crear perfil"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Título"
              value={formValues.title}
              onChange={(event) =>
                handleChangeValue("title", event.target.value)
              }
              required
              fullWidth
            />

            <TextField
              label="Descripción"
              value={formValues.description}
              onChange={(event) =>
                handleChangeValue("description", event.target.value)
              }
              multiline
              minRows={3}
              fullWidth
            />

            <TextField
              label="Habilidades requeridas"
              value={formValues.requiredSkills}
              onChange={(event) =>
                handleChangeValue("requiredSkills", event.target.value)
              }
              helperText="Separar cada habilidad con coma. Ejemplo: Python, SQL, APIs REST"
              fullWidth
            />

            <TextField
              label="Tecnologías"
              value={formValues.technologies}
              onChange={(event) =>
                handleChangeValue("technologies", event.target.value)
              }
              helperText="Separar cada tecnología con coma. Ejemplo: Flask, React, Supabase"
              fullWidth
            />

            <TextField
              label="Requisito de experiencia"
              value={formValues.experienceRequirement}
              onChange={(event) =>
                handleChangeValue("experienceRequirement", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Requisito de educación"
              value={formValues.educationRequirement}
              onChange={(event) =>
                handleChangeValue("educationRequirement", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Idiomas"
              value={formValues.languages}
              onChange={(event) =>
                handleChangeValue("languages", event.target.value)
              }
              helperText="Separar cada idioma con coma. Ejemplo: Español, Inglés"
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>
            Cancelar
          </Button>

          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
            {isEditMode ? "Guardar cambios" : "Crear perfil"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default JobProfilesPageContent;
