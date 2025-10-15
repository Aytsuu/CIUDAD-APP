import { type SetStateAction, useState } from "react";
import { useGetAnnouncement } from "@/pages/announcement/queries/announcementFetchQueries";
import type { Announcement } from "@/pages/announcement/queries/announcementFetchQueries";

export default function Announcements() {
  const { data: announcements, isLoading } = useGetAnnouncement();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publicAnnouncements = announcements?.filter((a) => a.ann_type === "public");

  const openModal = (announcement: SetStateAction<Announcement | null>) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(false);
  };

  return (
    <section className="relative w-full min-h-screen bg-white">
      <div className="container mx-auto px-6 border shadow-md">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Latest Updates
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Public Announcements
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Stay informed with our latest news, events, and important updates
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mt-8 rounded-full"></div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-300 text-lg font-medium mt-4">
              Loading announcements...
            </p>
          </div>
        ) : publicAnnouncements && publicAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {publicAnnouncements.map((announcement) => (
              <article
                key={announcement.ann_id}
                onClick={() => openModal(announcement)}
                className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/50 overflow-hidden hover:-translate-y-1 hover:border-blue-200"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-200 leading-tight">
                      {announcement.ann_title}
                    </h2>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 opacity-60"></div>
                  </div>

                  {announcement.ann_created_at && (
                    <div className="flex items-center gap-2 mb-6">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time className="text-sm text-slate-500 font-medium">
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
                      </time>
                    </div>
                  )}

                  <p className="text-slate-700 leading-relaxed mb-8 line-clamp-3">
                    {announcement.ann_details}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {announcement.ann_start_at && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-semibold text-xs uppercase tracking-wide">Start</p>
                          <p className="font-medium">
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
                      <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-semibold text-xs uppercase tracking-wide">End</p>
                          <p className="font-medium">
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
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={announcement.files[0].af_url || "/placeholder.svg"}
                      alt={announcement.files[0].af_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Active
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Announcements Yet</h3>
            <p className="text-slate-300 max-w-md mx-auto">
              There are currently no public announcements to display. Check back soon for updates and news.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Public Announcement
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {selectedAnnouncement.ann_title}
              </h2>

              {selectedAnnouncement.ann_created_at && (
                <div className="flex items-center gap-2 mb-8 pb-6 border-b border-slate-200">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time className="text-sm text-slate-500 font-medium">
                    Published on{" "}
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
                  </time>
                </div>
              )}

              <div className="prose prose-lg max-w-none mb-10">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.ann_details}
                </p>
              </div>

              {(selectedAnnouncement.ann_start_at || selectedAnnouncement.ann_end_at) && (
                <div className="flex items-center gap-4 flex-wrap pt-8 border-t border-slate-200">
                  {selectedAnnouncement.ann_start_at && (
                    <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wide mb-1">Event Start</p>
                        <p className="font-semibold">
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
                    <div className="flex items-center gap-3 px-6 py-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wide mb-1">Event End</p>
                        <p className="font-semibold">
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
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}