import { useRef, useState } from "react";
import { Alert, Box, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { TestResult } from "../../types/testResult";

interface Props {
  onImport: (results: TestResult[]) => void;
}

export default function JsonImportButton({ onImport }: Props) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (!Array.isArray(json)) {
        setError("Le fichier JSON doit contenir une liste.");
        return;
      }
      onImport(json);
    } catch {
      setError("Fichier JSON invalide.");
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
      >
        Importer un fichier JSON
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
