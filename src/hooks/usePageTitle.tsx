import { useEffect } from "react";
export function usePageTitle(title?: string){
    useEffect(() => {
        document.title = title ? `${title} — Toolbox4Devs` : 'Loading... - Toolbox4Devs'
    },[title]);
}