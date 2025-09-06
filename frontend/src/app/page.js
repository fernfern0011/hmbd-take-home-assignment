'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Chip, Button, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from "@mui/material";

const COLUMN_ORDER = ["subject_id", "arm", "change", "date", "days", "dose", "first_dose", "response", "tumor_type"];
const COLUMN_LABELS = {
  subject_id: "Subject ID",
  arm: "Arm",
  change: "Change (%)",
  date: "Date",
  days: "Days on Treatment",
  dose: "Dose (mg)",
  first_dose: "First Dose Date",
  response: "Response",
  tumor_type: "Tumor Type",
};

const getResponseChipVariant = (response) => {
  switch (response) {
    case "PR":
      return "success"
    case "SD":
      return "info"
    case "PD":
      return "error"
    default:
      return "default"
  }
}

export default function MainPage() {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [stats, setStats] = useState({
    uniquePatients: 0,
    treatmentArms: [],
    doseLevels: [],
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    // Fetch all spider data for table and summary stats
    fetch("/all-spider-data")
      .then((res) => res.json())
      .then((data) => {
        setTableData(data);
        if (data.length > 0) {
          const rawColumns = Object.keys(data[0]);
          const orderedColumns = COLUMN_ORDER.filter(k => rawColumns.includes(k));
          const finalColumns = orderedColumns.map(key => ({
            key,
            header: COLUMN_LABELS[key] ?? key, // Header label
          }));

          setColumns(finalColumns);
        }

        // Calculate summary stats from all data
        const uniquePatients = Array.from(new Set(data.map(d => d.subject_id))).length;
        const treatmentArms = Array.from(new Set(data.map(d => d.arm)));
        const doseLevels = Array.from(new Set(data.map(d => d.dose)));
        setStats({
          uniquePatients,
          treatmentArms,
          doseLevels,
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinical Trial Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Patient data and treatment outcomes overview</p>
        </div>

        {/* Summary Statistics */}
        <div className="mx-auto max-w-4xl">
          <div className="flex mb-4 items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Summary Statistics</h2>

            {/* Action Button */}
            <Link href="/spider-plot">
              <Button variant="contained" color="primary">
                View Spider Plot
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardContent>
                <Typography className="text-sm font-medium text-muted-foreground">Unique Patients</Typography>
                <div className="text-3xl font-bold text-card-foreground">{stats.uniquePatients}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent>
                <Typography className="text-sm font-medium text-muted-foreground">Treatment Arms</Typography>
                <div className="text-3xl font-bold text-card-foreground">{stats.treatmentArms.length > 0 ? stats.treatmentArms.join(", ") : "-"}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent>
                <Typography className="text-sm font-medium text-muted-foreground">Dose Levels</Typography>
                <div className="text-3xl font-bold text-card-foreground"> {stats.doseLevels.length > 0 ? stats.doseLevels.join(", ") : "-"}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Patient Data Table */}
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Patient Data Table</h2>
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow className="border-border">
                      {columns.map((col, index) => (
                        <TableCell key={index} className="font-semibold text-muted-foreground">{col.header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, index) => (
                      <TableRow key={index} className="border-border hover:bg-muted/50">
                        {columns.map((col) =>
                          col.key === "response" ? (
                            <TableCell key={col.key} className="font-medium text-card-foreground">
                              <Chip color={getResponseChipVariant(row[col.key])} label={row[col.key]} />
                            </TableCell>
                          ) : (
                            <TableCell key={col.key} className="font-medium text-card-foreground">
                              {row[col.key]}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={tableData.length}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={event => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}