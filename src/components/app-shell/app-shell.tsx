"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const DRAWER_WIDTH = 270;

type AppShellProps = {
  children: React.ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Inicio",
    href: "/",
    icon: <HomeOutlinedIcon />,
  },
  {
    label: "Gestión de perfiles",
    href: "/job-profiles",
    icon: <WorkOutlineIcon />,
  },
  {
    label: "Resultados",
    href: "/results",
    icon: <AssessmentOutlinedIcon />,
  },
  {
    label: "Reportes de ejecuciones",
    href: "/execution-reports",
    icon: <DescriptionOutlinedIcon />,
  },
];

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isRouteSelected = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: "#10275b",
              lineHeight: 1.2,
            }}
          >
            Clasificador CV
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sistema de preselección
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        {navigationItems.map((item) => {
          const selected = isRouteSelected(item.href);

          return (
            <ListItemButton
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={selected}
              onClick={closeMobileDrawer}
              sx={{
                minHeight: 52,
                mb: 0.75,
                borderRadius: 2,
                color: selected ? "primary.main" : "text.primary",
                "&.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.10)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.14)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 44,
                  color: selected ? "primary.main" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          m: 2,
          p: 2,
          border: "1px solid",
          borderColor: "primary.100",
          borderRadius: 2.5,
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          Datos protegidos
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.75,
            lineHeight: 1.6,
          }}
        >
          Las hojas de vida se utilizan únicamente para el proceso de evaluación
          y preselección.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #0b5ec4 0%, #1677d2 100%)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px !important",
            px: {
              xs: 1.5,
              md: 3,
            },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsMobileDrawerOpen(true)}
            sx={{
              mr: 1.5,
              display: {
                xs: "inline-flex",
                md: "none",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              width: 38,
              height: 38,
              mr: 1.5,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              backgroundColor: "#ffffff",
              color: "primary.main",
              fontWeight: 900,
            }}
          >
            CV
          </Box>

          <Typography
            variant="h6"
            component="div"
            fontWeight={700}
            sx={{
              flexGrow: 1,
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
              },
            }}
          >
            Clasificador de Hojas de Vida
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: DRAWER_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={isMobileDrawerOpen}
          onClose={closeMobileDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: "1px solid #e4e9f0",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          width: {
            xs: "100%",
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          minWidth: 0,
          minHeight: "100vh",
          backgroundColor: "#f5f7fb",
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important" }} />

        <Box
          sx={{
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
            px: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
            py: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
