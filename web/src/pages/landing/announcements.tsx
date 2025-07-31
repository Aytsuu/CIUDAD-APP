import { SetStateAction, useState } from "react"
import { Footer } from "./Footer"
import { useGetAnnouncement } from "@/pages/announcement/queries/announcementFetchQueries"
import type { Announcement } from "@/pages/announcement/queries/announcementFetchQueries"

export default function Announcements() {
  const { data: announcements, isLoading } = useGetAnnouncement()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (announcement: SetStateAction<Announcement | null>) => {
    setSelectedAnnouncement(announcement)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedAnnouncement(null)
    setIsModalOpen(false)
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-[#17294A] via-[#1a2d4f] to-[#1e3454] text-white min-h-screen">
      <section className="px-6 py-16 bg-gradient-to-b from-[#17294A]/90 to-[#1e3454]/90">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="inline-block mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent text-sm font-semibold tracking-wider uppercase px-4 py-2 border border-blue-400/30 rounded-full backdrop-blur-sm">
                  Official Communications
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                Latest Announcements
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 mx-auto rounded-full"></div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-200/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
              <p className="text-blue-100 text-lg">Loading announcements...</p>
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.ann_id}
                  onClick={() => openModal(announcement)}
                  className="cursor-pointer bg-white/95 backdrop-blur-sm text-[#17294A] rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-[1.01] overflow-hidden h-auto min-h-[12rem] md:min-h-[14rem]"
                >
                  <div className="flex h-full">
                    {/* LEFT CONTENT */}
                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-extrabold leading-tight text-[#17294A] hover:text-blue-700 transition-colors">
                          {announcement.ann_title}
                        </h3>

                        {announcement.ann_created_at && (
                          <p className="text-sm text-gray-500">
                            Posted on{" "}
                            {new Date(announcement.ann_created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}

                        <p
                          className="text-gray-700 text-base leading-relaxed overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {announcement.ann_details}
                        </p>
                      </div>

                      {/* Start / End Date */}
                      <div className="flex flex-col gap-2 pt-2">
                        {announcement.ann_start_at && (
                          <div className="flex items-center gap-2 p-1.5 bg-green-50 rounded border-l-2 border-green-400">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide block">
                                Start
                              </span>
                              <span className="text-xs font-medium text-green-800">
                                {new Date(announcement.ann_start_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                        {announcement.ann_end_at && (
                          <div className="flex items-center gap-2 p-1.5 bg-red-50 rounded border-l-2 border-red-400">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide block">
                                End
                              </span>
                              <span className="text-xs font-medium text-red-800">
                                {new Date(announcement.ann_end_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    {announcement.files && announcement.files.length > 0 && (
                      <div className="w-56 flex-shrink-0 relative">
                        <div className="relative h-full overflow-hidden rounded-r-lg">
                          <img
                            src={announcement.files[0].af_url || "/placeholder.svg"}
                            alt={announcement.files[0].af_name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                              Active
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-blue-200/50 rounded-xl"></div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Announcements Available</h3>
              <p className="text-blue-100 max-w-lg mx-auto text-lg">
                There are currently no announcements to display. Please check back later for updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="relative bg-white text-[#17294A] rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col md:flex-row overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 text-gray-500 hover:text-red-500 text-3xl font-bold z-10"
            >
              &times;
            </button>

            {/* DETAILS SECTION */}
            <div className={`p-8 overflow-y-auto h-full flex flex-col justify-between ${(selectedAnnouncement.files && selectedAnnouncement.files.length > 0) ? "md:w-1/2" : "w-full"}`}>
              <div>
                <h2 className="text-4xl font-bold mb-2">{selectedAnnouncement.ann_title}</h2>

                {selectedAnnouncement.ann_created_at && (
                  <p className="text-sm text-gray-500 mb-4">
                    Posted on{" "}
                    {new Date(selectedAnnouncement.ann_created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}

                <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedAnnouncement.ann_details}
                </p>
              </div>

              <div className="pt-6 space-y-2 text-sm">
                {selectedAnnouncement.ann_start_at && (
                  <p className="text-green-700 font-medium">
                    <strong>Start:</strong>{" "}
                    {new Date(selectedAnnouncement.ann_start_at).toLocaleDateString()}
                  </p>
                )}
                {selectedAnnouncement.ann_end_at && (
                  <p className="text-red-700 font-medium">
                    <strong>End:</strong>{" "}
                    {new Date(selectedAnnouncement.ann_end_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* IMAGE SECTION */}
            {selectedAnnouncement.files && selectedAnnouncement.files.length > 0 && (
              <div className="hidden md:block md:w-1/2 h-full">
                <img
                  src={selectedAnnouncement.files[0].af_url}
                  alt={selectedAnnouncement.files[0].af_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
