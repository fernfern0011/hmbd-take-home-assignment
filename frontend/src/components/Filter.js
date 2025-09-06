'use client';

import { Card, CardContent, Typography } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

export default function Filter({
    armOptions = [],
    doseOptions = [],
    tumorOptions = [],
    selectedArm = "All",
    selectedDose = "All",
    selectedTumor = "All",
    onArmChange,
    onDoseChange,
    onTumorChange,
}) {
    return (
        <Card style={{ maxWidth: 200, borderRadius: '8px' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Data Filters</Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Treatment Arms</InputLabel>
                    <Select
                        value={selectedArm}
                        label="Treatment Arms"
                        onChange={e => onArmChange(e.target.value)}
                    >
                        <MenuItem value="All">All Arms</MenuItem>
                        {armOptions.map(arm => (
                            <MenuItem key={arm} value={arm}>{arm}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Doses</InputLabel>
                    <Select
                        value={selectedDose}
                        label="Doses"
                        onChange={e => onDoseChange(e.target.value)}
                    >
                        <MenuItem value="All">All Doses</MenuItem>
                        {doseOptions.map(dose => (
                            <MenuItem key={dose} value={dose}>{dose}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Tumor Types</InputLabel>
                    <Select
                        value={selectedTumor}
                        label="Tumor Types"
                        onChange={e => onTumorChange(e.target.value)}
                    >
                        <MenuItem value="All">All Types</MenuItem>
                        {tumorOptions.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </CardContent>
        </Card>
    );
}