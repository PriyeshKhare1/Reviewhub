import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, FacebookIcon, TwitterIcon, WhatsappIcon } from "react-share";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton({ url, title }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || "Check out this review on ReviewHub";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="gap-2 bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Review
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Copy Link */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Copy Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className={`gap-2 ${
                        copied
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Social Share */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Share on Social Media
                  </label>
                  <div className="flex gap-3 justify-center">
                    <FacebookShareButton url={shareUrl} quote={shareTitle}>
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <FacebookIcon size={32} round />
                      </div>
                    </FacebookShareButton>

                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <TwitterIcon size={32} round />
                      </div>
                    </TwitterShareButton>

                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <WhatsappIcon size={32} round />
                      </div>
                    </WhatsappShareButton>
                  </div>
                </div>

                {/* QR Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">
                    Scan QR Code
                  </label>
                  <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <QRCodeSVG
                      value={shareUrl}
                      size={180}
                      level="H"
                      includeMargin={true}
                      bgColor="transparent"
                      fgColor="currentColor"
                      className="text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
