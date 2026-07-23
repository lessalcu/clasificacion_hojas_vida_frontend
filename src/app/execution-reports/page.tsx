import { Suspense } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import ExecutionReportsPageContent from "./page-content";

const ExecutionReportsPage = () => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: 360,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <ExecutionReportsPageContent />
    </Suspense>
  );
};

export default ExecutionReportsPage;