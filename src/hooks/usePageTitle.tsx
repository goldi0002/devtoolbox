import { useEffect } from "react";
export function usePageTitle(title?: string){
    useEffect(() => {
        document.title = title ? `${title} — DevToolbox` : 'DevToolbox'
    },[title]);
}