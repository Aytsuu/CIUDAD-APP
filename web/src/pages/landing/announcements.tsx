"use client"

import { type SetStateAction, useState } from "react"
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
    <main className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white min-h-screen">
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900/95 to-indigo-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl"></div>

            <div className="relative">
              <div className="inline-block mb-6">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent text-sm font-bold tracking-wider uppercase px-6 py-3 border border-blue-400/40 rounded-full backdrop-blur-md bg-white/5 shadow-lg shadow-blue-500/20">
                  Official Communications
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight drop-shadow-2xl">
                Latest Announcements
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mx-auto rounded-full shadow-lg shadow-blue-400/50"></div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-transparent border-t-blue-400 border-r-cyan-300 rounded-full animate-spin mb-4 shadow-lg"></div>
              <p className="text-blue-100 text-lg font-medium">Loading announcements...</p>
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {announcements.map((announcement) => (
                <div
                  key={announcement.ann_id}
                  onClick={() => openModal(announcement)}
                  className="group cursor-pointer bg-white/95 backdrop-blur-sm text-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-white/20 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1 min-w-0 p-8 flex flex-col justify-between relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>

                      <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-3 break-words text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                          {announcement.ann_title}
                        </h3>

                        {announcement.ann_created_at && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <p className="text-sm text-slate-600 font-medium">
                              Posted on{" "}
                              {new Date(announcement.ann_created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {" at "}
                              {new Date(announcement.ann_created_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        )}

                        <p className="text-slate-700 leading-relaxed mb-6 break-words whitespace-pre-wrap text-lg">
                          {announcement.ann_details}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-6 flex-wrap relative z-10">
                        {announcement.ann_start_at && (
                          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 group/badge">
                            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                            <div className="text-sm">
                              <p className="text-emerald-700 font-bold uppercase text-xs tracking-wide">Event Start</p>
                              <p className="text-emerald-900 font-semibold">
                                {new Date(announcement.ann_start_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {" at "}
                                {new Date(announcement.ann_start_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {announcement.ann_end_at && (
                          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-200 shadow-md hover:shadow-lg transition-all duration-300 group/badge">
                            <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-red-500 rounded-full animate-pulse"></div>
                            <div className="text-sm">
                              <p className="text-rose-700 font-bold uppercase text-xs tracking-wide">Event End</p>
                              <p className="text-rose-900 font-semibold">
                                {new Date(announcement.ann_end_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {" at "}
                                {new Date(announcement.ann_end_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {announcement.files && announcement.files.length > 0 && (
                      <div className="w-full h-52 relative shrink-0 overflow-hidden">
                        <img
                          src={announcement.files[0].af_url || "/placeholder.svg"}
                          alt={announcement.files[0].af_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <span className="absolute top-4 right-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-sm">
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
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-white/10 to-blue-500/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="w-12 h-12 border-4 border-blue-200/50 rounded-2xl animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">No Announcements Available</h3>
              <p className="text-blue-100 max-w-lg mx-auto text-lg leading-relaxed">
                There are currently no announcements to display. Please check back later for updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">
          <div className="relative bg-white text-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200 text-xl font-bold z-10"
            >
              &times;
            </button>

            <div className="p-10">
              <h2 className="text-4xl md:text-5xl font-black flex items-center gap-2 mb-3 break-words text-slate-900">
                {selectedAnnouncement.ann_title}
              </h2>

              {selectedAnnouncement.ann_created_at && (
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-slate-600 font-medium">
                    Posted on{" "}
                    {new Date(selectedAnnouncement.ann_created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" at "}
                    {new Date(selectedAnnouncement.ann_created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              )}

              <p className="text-slate-700 leading-relaxed mb-10 whitespace-pre-wrap break-words text-lg">
                {selectedAnnouncement.ann_details}
              </p>

              <div className="flex items-center gap-6 mt-8 flex-wrap border-t border-slate-200 pt-8">
                {selectedAnnouncement.ann_start_at && (
                  <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <p className="text-emerald-700 font-bold uppercase text-xs tracking-wide">Event Start</p>
                      <p className="text-emerald-900 font-semibold">
                        {new Date(selectedAnnouncement.ann_start_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" at "}
                        {new Date(selectedAnnouncement.ann_start_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedAnnouncement.ann_end_at && (
                  <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-200 shadow-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-red-500 rounded-full"></div>
                    <div className="text-sm">
                      <p className="text-rose-700 font-bold uppercase text-xs tracking-wide">Event End</p>
                      <p className="text-rose-900 font-semibold">
                        {new Date(selectedAnnouncement.ann_end_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" at "}
                        {new Date(selectedAnnouncement.ann_end_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
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
