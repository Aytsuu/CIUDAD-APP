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
                  className="cursor-pointer bg-white text-[#17294A] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* LEFT CONTENT */}
                    <div className="flex-1 min-w-0 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-2 break-words">
                          {announcement.ann_title}
                        </h3>

                        {announcement.ann_created_at && (
                          <p className="text-sm text-gray-500 mb-4">
                            Posted on{" "}
                            {new Date(announcement.ann_created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}

                        <p className="text-gray-700 leading-relaxed mb-4 break-words whitespace-pre-wrap">
                          {announcement.ann_details}
                        </p>
                      </div>

                      {/* Start / End Dates */}
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
                        {announcement.ann_start_at && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <div className="text-sm">
                              <p className="text-green-700 font-semibold uppercase text-xs">
                                Start Date
                              </p>
                              <p className="text-green-800 font-medium">
                                {new Date(announcement.ann_start_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {announcement.ann_end_at && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <div className="text-sm">
                              <p className="text-red-700 font-semibold uppercase text-xs">
                                End Date
                              </p>
                              <p className="text-red-800 font-medium">
                                {new Date(announcement.ann_end_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    {announcement.files && announcement.files.length > 0 && (
                      <div className="md:w-64 relative shrink-0">
                        <img
                          src={announcement.files[0].af_url}
                          alt={announcement.files[0].af_name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold shadow">
                          ● Active
                        </span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative bg-white text-[#17294A] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>

            <div className="p-8">
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2 mb-2 break-words">
                {selectedAnnouncement.ann_title}
              </h2>

              {/* Posted Date */}
              {selectedAnnouncement.ann_created_at && (
                <p className="text-sm text-gray-500 mb-6">
                  Posted on{" "}
                  {new Date(selectedAnnouncement.ann_created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Details */}
              <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-wrap break-words">
                {selectedAnnouncement.ann_details}
              </p>

              {/* Start / End Dates */}
              <div className="flex items-center gap-4 mt-6 flex-wrap border-t pt-6">
                {selectedAnnouncement.ann_start_at && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <div className="text-sm">
                      <p className="text-green-700 font-semibold uppercase text-xs">Start Date</p>
                      <p className="text-green-800 font-medium">
                        {new Date(selectedAnnouncement.ann_start_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedAnnouncement.ann_end_at && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <div className="text-sm">
                      <p className="text-red-700 font-semibold uppercase text-xs">End Date</p>
                      <p className="text-red-800 font-medium">
                        {new Date(selectedAnnouncement.ann_end_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
