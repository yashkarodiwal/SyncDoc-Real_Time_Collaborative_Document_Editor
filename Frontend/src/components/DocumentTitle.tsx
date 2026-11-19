
import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
    documentId: string;
}

export default function DocumentTitle({ documentId }: Props) {

    const [title, setTitle] = useState("Loading...");

    useEffect(() => {

        const loadTitle = async () => {

            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `https://syncdoc.onrender.com/api/documents/${documentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setTitle(res.data.title || "Untitled Document");

            } catch (error) {
                console.error("Title loading failed:", error);
                setTitle("Untitled Document");
            }

        };

        loadTitle();

    }, [documentId]);

    return (
        <h2 className="text-xl font-semibold p-2 text-slate-800">
            {title}
        </h2>
    );

}
