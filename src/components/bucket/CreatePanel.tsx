"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { CreateBucketListForm } from "@/components/bucket/CreateBucketListForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePanel({ isOpen, onClose }: Props) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 right-0 z-40 flex w-full flex-col bg-white lg:max-w-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-6 pb-6">
              <h2 className="text-lg font-semibold text-zinc-900">버킷리스트 작성</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="lg:hidden rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <CreateBucketListForm
              onSuccess={() => {
                onClose();
                router.refresh();
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
