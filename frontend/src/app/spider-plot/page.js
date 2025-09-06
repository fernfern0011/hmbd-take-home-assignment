'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import Link from "next/link";
import SpiderPlot from "@/components/SpiderPlot";
import Filter from "@/components/Filter";

export default function SpiderPage() {
    const [armOptions, setArmOptions] = useState([]);
    const [doseOptions, setDoseOptions] = useState([]);
    const [tumorOptions, setTumorOptions] = useState([]);
    const [selectedArm, setSelectedArm] = useState("All");
    const [selectedDose, setSelectedDose] = useState("All");
    const [selectedTumor, setSelectedTumor] = useState("All");

    useEffect(() => {
        fetch("/filter")
            .then(res => res.json())
            .then(data => {
                setArmOptions(data.treatmentArms || []);
                setDoseOptions(data.doseLevels || []);
                setTumorOptions(data.tumorTypes || []);
            });
    }, []);

    // Build query params for SpiderPlot
    const arms = selectedArm === "All" ? armOptions.join(",") : selectedArm;
    const doses = selectedDose === "All" ? doseOptions.join(",") : selectedDose;
    const tumor_types = selectedTumor === "All" ? tumorOptions.join(",") : selectedTumor;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-muted-foreground">Spider Plot Visualization</h1>
                        <p className="mt-2 text-muted-foreground">Patient tumor response over time</p>
                    </div>
                    <Link href="/">
                        <Button variant="contained" color="primary">Back to Dashboard</Button>
                    </Link>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                    <Filter
                        armOptions={armOptions}
                        doseOptions={doseOptions}
                        tumorOptions={tumorOptions}
                        selectedArm={selectedArm}
                        selectedDose={selectedDose}
                        selectedTumor={selectedTumor}
                        onArmChange={setSelectedArm}
                        onDoseChange={setSelectedDose}
                        onTumorChange={setSelectedTumor}
                    />
                    <SpiderPlot arms={arms} doses={doses} tumor_types={tumor_types} />
                </div>
            </div>
        </div>
    );
}