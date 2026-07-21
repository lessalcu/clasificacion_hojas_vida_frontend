"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
  useCreateJobProfile,
  useDeleteJobProfile,
  useJobProfiles,
  useUpdateJobProfile,
} from "@/services/api/job-profiles/use-job-profiles";
import type {
  CreateJobProfilePayload,
  JobProfile,
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

type JobProfileFormErrors = Partial<Record<keyof JobProfileFormValues, string>>;

const TOAST_DURATION = 5000;

const initialFormValues: JobProfileFormValues = {
  title: "",
  description: "",
  requiredSkills: "",
  technologies: "",
  experienceRequirement: "",
  educationRequirement: "",
  languages: "",
};

const parseCommaSeparatedValues = (value: string): string[] => {
  return Array.from(
    new Map(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => [item.toLowerCase(), item])
    ).values()
  );
};

const joinValues = (values: string[] | null | undefined): string => {
  return Array.isArray(values) ? values.join(", ") : "";
};

const buildPayload = (
  values: JobProfileFormValues
): CreateJobProfilePayload => {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    required_skills: parseCommaSeparatedValues(values.requiredSkills),
    technologies: parseCommaSeparatedValues(values.technologies),
    experience_requirement: values.experienceRequirement.trim(),
    education_requirement: values.educationRequirement.trim(),
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

const validateForm = (values: JobProfileFormValues): JobProfileFormErrors => {
  const errors: JobProfileFormErrors = {};

  const title = values.title.trim();
  const description = values.description.trim();
  const requiredSkills = parseCommaSeparatedValues(values.requiredSkills);
  const technologies = parseCommaSeparatedValues(values.technologies);
  const experienceRequirement = values.experienceRequirement.trim();
  const educationRequirement = values.educationRequirement.trim();
  const languages = parseCommaSeparatedValues(values.languages);

  if (!title) {
    errors.title = "El título es obligatorio.";
  } else if (title.length < 3) {
    errors.title = "El título debe tener al menos 3 caracteres.";
  } else if (title.length > 120) {
    errors.title = "El título no puede superar los 120 caracteres.";
  }

  if (!description) {
    errors.description = "La descripción es obligatoria.";
  } else if (description.length < 3) {
    errors.description = "La descripción debe tener al menos 3 caracteres.";
  } else if (description.length > 1000) {
    errors.description = "La descripción no puede superar los 1000 caracteres.";
  }

  if (requiredSkills.length === 0) {
    errors.requiredSkills = "Debe ingresar al menos una habilidad requerida.";
  } else if (requiredSkills.length > 30) {
    errors.requiredSkills = "Solo puede ingresar hasta 30 habilidades.";
  }

  if (technologies.length === 0) {
    errors.technologies = "Debe ingresar al menos una tecnología.";
  } else if (technologies.length > 30) {
    errors.technologies = "Solo puede ingresar hasta 30 tecnologías.";
  }

  if (!experienceRequirement) {
    errors.experienceRequirement =
      "El requisito de experiencia es obligatorio.";
  } else if (experienceRequirement.length < 2) {
    errors.experienceRequirement =
      "El requisito de experiencia debe tener al menos 2 caracteres.";
  } else if (experienceRequirement.length > 250) {
    errors.experienceRequirement =
      "El requisito de experiencia no puede superar los 250 caracteres.";
  }

  if (!educationRequirement) {
    errors.educationRequirement = "El requisito de educación es obligatorio.";
  } else if (educationRequirement.length < 2) {
    errors.educationRequirement =
      "El requisito de educación debe tener al menos 2 caracteres.";
  } else if (educationRequirement.length > 250) {
    errors.educationRequirement =
      "El requisito de educación no puede superar los 250 caracteres.";
  }

  if (languages.length === 0) {
    errors.languages = "Debe ingresar al menos un idioma.";
  } else if (languages.length > 20) {
    errors.languages = "Solo puede ingresar hasta 20 idiomas.";
  }

  return errors;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
};

const showSuccessToast = (message: string) => {
  toast.success(message, {
    autoClose: TOAST_DURATION,
  });
};

const showErrorToast = (message: string) => {
  toast.error(message, {
    autoClose: TOAST_DURATION,
  });
};

const renderChips = (items: string[] | null | undefined) => {
  if (!items?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          size="small"
          sx={{
            height: 24,
            maxWidth: "100%",
            fontSize: "0.72rem",
            "& .MuiChip-label": {
              px: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      ))}
    </Stack>
  );
};

const TextTableCell = ({ value }: { value: string | null | undefined }) => {
  const displayValue = value?.trim() || "-";

  return (
    <Tooltip title={displayValue} placement="top">
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.78rem",
          lineHeight: 1.4,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {displayValue}
      </Typography>
    </Tooltip>
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

  const [formErrors, setFormErrors] = useState<JobProfileFormErrors>({});

  const jobProfiles = data ?? [];

  const isSaving =
    createJobProfileMutation.isPending || updateJobProfileMutation.isPending;

  const isDeleting = deleteJobProfileMutation.isPending;

  const isEditMode = Boolean(selectedProfile);

  const handleOpenCreateDialog = () => {
    setSelectedProfile(null);
    setFormValues(initialFormValues);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (profile: JobProfile) => {
    setSelectedProfile(profile);
    setFormValues(buildFormValuesFromProfile(profile));
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedProfile(null);
    setFormValues(initialFormValues);
    setFormErrors({});
  };

  const handleChangeValue = (
    field: keyof JobProfileFormValues,
    value: string
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);

      showErrorToast("Complete correctamente todos los campos obligatorios.");

      return;
    }

    const payload = buildPayload(formValues);

    try {
      if (selectedProfile) {
        await updateJobProfileMutation.mutateAsync({
          id: selectedProfile.id,
          payload,
        });

        showSuccessToast("Perfil actualizado correctamente.");
      } else {
        await createJobProfileMutation.mutateAsync(payload);

        showSuccessToast("Perfil creado correctamente.");
      }

      handleCloseDialog();
    } catch (mutationError) {
      showErrorToast(getErrorMessage(mutationError));
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

      showSuccessToast("Perfil eliminado correctamente.");
    } catch (mutationError) {
      showErrorToast(getErrorMessage(mutationError));
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

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
          onClick={() => {
            void refetch();
          }}
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
          No se pudo consultar el backend. {getErrorMessage(error)}
        </Alert>
      )}

      {!isLoading && !isError && jobProfiles.length === 0 && (
        <Alert severity="info">
          No existen perfiles registrados o el backend devolvió una lista vacía.
        </Alert>
      )}

      {jobProfiles.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <Table
            size="small"
            sx={{
              width: "100%",
              tableLayout: "fixed",
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "grey.100",
                }}
              >
                <TableCell
                  sx={{
                    width: "11%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Título
                </TableCell>

                <TableCell
                  sx={{
                    width: "17%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Descripción
                </TableCell>

                <TableCell
                  sx={{
                    width: "15%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Habilidades
                </TableCell>

                <TableCell
                  sx={{
                    width: "13%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Tecnologías
                </TableCell>

                <TableCell
                  sx={{
                    width: "14%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Experiencia
                </TableCell>

                <TableCell
                  sx={{
                    width: "14%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Educación
                </TableCell>

                <TableCell
                  sx={{
                    width: "9%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1,
                    py: 1.5,
                  }}
                >
                  Idiomas
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    width: "7%",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 0.5,
                    py: 1.5,
                  }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {jobProfiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    <Tooltip title={profile.title} placement="top">
                      <Typography
                        fontWeight={700}
                        sx={{
                          fontSize: "0.82rem",
                          lineHeight: 1.35,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {profile.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    <TextTableCell value={profile.description} />
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    {renderChips(profile.required_skills)}
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    {renderChips(profile.technologies)}
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    <TextTableCell value={profile.experience_requirement} />
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    <TextTableCell value={profile.education_requirement} />
                  </TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: "top",
                      px: 1,
                      py: 1.5,
                    }}
                  >
                    {renderChips(profile.languages)}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      verticalAlign: "top",
                      px: 0.25,
                      py: 1,
                    }}
                  >
                    <Stack direction="row" justifyContent="center" spacing={0}>
                      <Tooltip title="Editar perfil">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(profile)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar perfil">
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              void handleDelete(profile);
                            }}
                            disabled={isDeleting}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              pt: 1,
              mb: 2,
            }}
          >
            Todos los campos son obligatorios. En habilidades, tecnologías e
            idiomas, separe cada valor con una coma.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Título"
              value={formValues.title}
              onChange={(event) =>
                handleChangeValue("title", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.title)}
              helperText={formErrors.title}
              inputProps={{
                minLength: 3,
                maxLength: 120,
              }}
            />

            <TextField
              label="Descripción"
              value={formValues.description}
              onChange={(event) =>
                handleChangeValue("description", event.target.value)
              }
              required
              multiline
              minRows={3}
              fullWidth
              error={Boolean(formErrors.description)}
              helperText={
                formErrors.description ??
                "Ingrese una descripción de entre 3 y 1000 caracteres."
              }
              inputProps={{
                minLength: 3,
                maxLength: 1000,
              }}
            />

            <TextField
              label="Habilidades requeridas"
              value={formValues.requiredSkills}
              onChange={(event) =>
                handleChangeValue("requiredSkills", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.requiredSkills)}
              helperText={
                formErrors.requiredSkills ??
                "Separar con coma. Ejemplo: Python, SQL, APIs REST"
              }
            />

            <TextField
              label="Tecnologías"
              value={formValues.technologies}
              onChange={(event) =>
                handleChangeValue("technologies", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.technologies)}
              helperText={
                formErrors.technologies ??
                "Separar con coma. Ejemplo: Flask, React, Supabase"
              }
            />

            <TextField
              label="Requisito de experiencia"
              value={formValues.experienceRequirement}
              onChange={(event) =>
                handleChangeValue("experienceRequirement", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.experienceRequirement)}
              helperText={
                formErrors.experienceRequirement ??
                "Ejemplo: Dos años de experiencia en desarrollo backend."
              }
              inputProps={{
                minLength: 2,
                maxLength: 250,
              }}
            />

            <TextField
              label="Requisito de educación"
              value={formValues.educationRequirement}
              onChange={(event) =>
                handleChangeValue("educationRequirement", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.educationRequirement)}
              helperText={
                formErrors.educationRequirement ??
                "Ejemplo: Ingeniería en Sistemas o carreras relacionadas."
              }
              inputProps={{
                minLength: 2,
                maxLength: 250,
              }}
            />

            <TextField
              label="Idiomas"
              value={formValues.languages}
              onChange={(event) =>
                handleChangeValue("languages", event.target.value)
              }
              required
              fullWidth
              error={Boolean(formErrors.languages)}
              helperText={
                formErrors.languages ??
                "Separar con coma. Ejemplo: Español, Inglés"
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving}
          >
            {isEditMode ? "Guardar cambios" : "Crear perfil"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default JobProfilesPageContent;
