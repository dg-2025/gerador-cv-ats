"use client";
import dynamic from "next/dynamic";
import React from "react";


const FundoEstelar = dynamic(() => import("./FundoEstelar"), { 
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black -z-50" /> 
});

const EstrelasCadentes = dynamic(() => import("./EstrelasCadentes"), { 
    ssr: false 
});

const BackgroundWrapper = () => {
    return (
        <>
            <FundoEstelar />
            <EstrelasCadentes />
        </>
    );
};

export default BackgroundWrapper;