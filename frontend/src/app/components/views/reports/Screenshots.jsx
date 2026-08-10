import { useState } from "react";
import { Camera, Eye, X } from "lucide-react";
import { Card } from "../../shared/ui";
import { screenshots } from "../../../data/mockData";

export function ScreenshotsScreen() {
  const [lightbox, setLightbox] = useState(null);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">User Screenshots</h1>
      <div className="grid grid-cols-3 gap-4">
        {screenshots.map(s => (
          <Card key={s.id} className="overflow-hidden cursor-pointer group" onClick={() => setLightbox(s.id)}>
            <div className="bg-gradient-to-br from-teal-100 to-teal-50 h-36 flex items-center justify-center relative">
              <Camera size={28} className="text-teal-300 group-hover:text-teal-500 transition" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-[#1A202C]">{s.user}</p>
              <p className="text-xs text-[#718096] font-mono mt-0.5">{s.timestamp}</p>
            </div>
          </Card>
        ))}
      </div>
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-teal-100 to-teal-50 h-64 flex items-center justify-center">
              <Camera size={48} className="text-teal-300" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1A202C]">{screenshots.find(s => s.id === lightbox)?.user}</p>
                <p className="text-xs text-[#718096] font-mono">{screenshots.find(s => s.id === lightbox)?.timestamp}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="p-2 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
