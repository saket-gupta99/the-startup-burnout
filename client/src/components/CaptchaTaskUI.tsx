import React, { useMemo, useState } from "react";
import Button from "./Button";
import toast from "react-hot-toast";
import { shuffle } from "../libs/utils";

interface CaptchaTaskUIProps {
  onTaskComplete: () => void;
}

function randomCaptchaText(len = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const baseImages: { src: string; alt: string; isComputer: boolean }[] = [
  { src: "/images/computer-1.jpg", alt: "image of a laptop", isComputer: true },
  { src: "/images/random-1.png", alt: "random image", isComputer: false },
  { src: "/images/computer-2.jpg", alt: "image of a laptop", isComputer: true },
  { src: "/images/computer-3.jpg", alt: "image of a laptop", isComputer: true },
  { src: "/images/random-2.png", alt: "random image", isComputer: false },
  { src: "/images/computer-4.jpg", alt: "image of a laptop", isComputer: true },
  { src: "/images/random-3.jpg", alt: "random image", isComputer: false },
  { src: "/images/computer-5.jpg", alt: "image of a laptop", isComputer: true },
  { src: "/images/random-4.jpg", alt: "random image", isComputer: false },
];

export default function CaptchaTaskUI({ onTaskComplete }: CaptchaTaskUIProps) {
  // randomized captcha text + math
  const [captchaText] = useState(() => randomCaptchaText(5));
  const [math] = useState(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { a, b, answer: a + b };
  });

  // shuffle images
  const images = useMemo(() => shuffle(baseImages), []);

  const correctComputerIndexes = useMemo(
    () =>
      images
        .map((img, idx) => (img.isComputer ? idx : -1))
        .filter((i) => i !== -1),
    [images]
  );

  const [captchaData, setCaptchaData] = useState({
    captcha1: "",
    captcha3: "",
  });
  const [imagesClicked, setImagesClicked] = useState<number[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCaptchaData((prev) => ({ ...prev, [name]: value }));
  }

  function toggleImageSelection(id: number) {
    setImagesClicked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function validate() {
    const errors: string[] = [];

    // text captcha
    if (
      captchaData.captcha1.trim().toUpperCase() !== captchaText.toUpperCase()
    ) {
      errors.push("Text CAPTCHA is incorrect.");
    }

    // images: must select exactly the images that are marked isComputer=true
    const sortedSelected = [...imagesClicked].sort((a, b) => a - b);
    const sortedCorrect = [...correctComputerIndexes].sort((a, b) => a - b);

    const imagesCorrect =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((v, i) => v === sortedCorrect[i]);

    if (!imagesCorrect) {
      errors.push("Select all computer images correctly.");
    }

    // math captcha
    if (Number(captchaData.captcha3.trim()) !== math.answer) {
      errors.push("Math CAPTCHA answer is incorrect.");
    }

    if (errors.length) {
      toast.error(errors[0]);
      return false;
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    toast.success("CAPTCHA tasks completed!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Prove you&apos;re not a bot. Solve the CAPTCHAs.
      </p>

      <div className="max-h-[60vh] overflow-y-auto pr-2 pb-4">
        <div className="space-y-4">
          {/* CAPTCHA 1: Text */}
          <div className="space-y-2">
            <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-mono">
              {captchaText}
            </div>
            <input
              type="text"
              placeholder="Type the text above"
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-400"
              name="captcha1"
              value={captchaData.captcha1}
              onChange={handleChange}
            />
          </div>

          {/* CAPTCHA 2: Image selection */}
          <div className="space-y-2">
            <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-xs">
              <span className="font-semibold">Select all computers</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[0.7rem] place-items-center">
              {images.map((img, idx) => {
                const isSelected = imagesClicked.includes(idx);
                return (
                  <img
                    key={idx}
                    src={img.src}
                    alt={img.alt}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleImageSelection(idx)}
                    className={`h-20 w-28 object-cover rounded-md cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-green-500 shadow-lg"
                        : "hover:ring-1 ring-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* CAPTCHA 3: Math */}
          <div className="space-y-2">
            <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-xs">
              What is{" "}
              <span className="mx-1 font-semibold">
                {math.a} + {math.b}
              </span>
              ?
            </div>
            <input
              type="number"
              placeholder="Answer"
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-400"
              name="captcha3"
              value={captchaData.captcha3}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Button variant="task" className="mt-4" onClick={handleSubmit}>
        Verify
      </Button>
    </div>
  );
}
