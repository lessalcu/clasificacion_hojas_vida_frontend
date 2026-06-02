"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import HomeIcon from "@mui/icons-material/Home";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WorkIcon from "@mui/icons-material/Work";

const drawerWidth = 270;

const mainMenuItems = [
  {
    title: "Inicio",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    title: "Gestión de perfiles",
    href: "/job-profiles",
    icon: <WorkIcon />,
  },
];

const futureMenuItems = [
  {
    title: "Carga de hojas de vida",
    icon: <UploadFileIcon />,
  },
  {
    title: "Resultados y reportes",
    icon: <AssessmentIcon />,
  },
];

type AppShellProps = {
  children: React.ReactNode;
};

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const [isDesktopDrawerOpen, setIsDesktopDrawerOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setIsDesktopDrawerOpen((currentValue) => !currentValue);
    setIsMobileDrawerOpen((currentValue) => !currentValue);
  };

  const handleCloseMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const drawerContent = (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Clasificador CV
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistema de preselección
          </Typography>
        </Box>

        <Tooltip title="Cerrar menú">
          <IconButton
            onClick={handleToggleDrawer}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <List>
        {mainMenuItems.map((item) => {
          const isSelected =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={NextLink}
                href={item.href}
                selected={isSelected}
                onClick={handleCloseMobileDrawer}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Próximos módulos
        </Typography>
      </Box>

      <List>
        {futureMenuItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton disabled>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
              <Chip label="Próximo" size="small" />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleToggleDrawer}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{
              ml: 2,
              fontWeight: 700,
            }}
          >
            Clasificador de Hojas de Vida
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={isDesktopDrawerOpen}
        sx={{
          display: { xs: "none", md: "block" },
          width: isDesktopDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "64px",
            height: "calc(100% - 64px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={isMobileDrawerOpen}
        onClose={handleCloseMobileDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          mt: "64px",
          p: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;