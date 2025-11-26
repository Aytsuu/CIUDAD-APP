"use client"

import { useMemo } from "react"
import { Calendar, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../maternal-tabs/appointments/columns"
import { useCombinedFollowUps } from "../queries/maternalFetchQueries"

interface FollowUpVisit {
  followv_id: number
  followv_date: string
  followv_status: string
  followv_description: string
  created_at: string
  completed_at: string | null
  patrec: number
}

interface FollowUpVisitsOverallProps {
  followUpVisits?: FollowUpVisit[]
  patientId?: string
}

export default function FollowUpVisitsOverall({ followUpVisits = [], patientId }: FollowUpVisitsOverallProps) {
  const { data: combinedData, isLoading } = useCombinedFollowUps(
    patientId || "",
    undefined
  )

  const mergedVisits: FollowUpVisit[] = useMemo(() => {
    if (combinedData?.results && patientId) {
      return combinedData.results.map((v: any) => ({
        followv_id: v.visit_id,
        followv_date: v.visit_date,
        followv_status: v.status,
        followv_description: v.description || (v.source === 'postpartum' ? 'Postpartum Assessment' : 'Prenatal Follow-up'),
        created_at: v.created_at,
        completed_at: v.completed_at,
        patrec: 0,
      }))
    }
    return followUpVisits
  }, [combinedData, patientId, followUpVisits])
  // Categorize visits by status
  const categorizedVisits = useMemo(() => {
    const now = new Date()
    
    const pending: FollowUpVisit[] = []
    const completed: FollowUpVisit[] = []
    const missed: FollowUpVisit[] = []

    mergedVisits.forEach(visit => {
      const visitDate = new Date(visit.followv_date)
      const status = visit.followv_status?.toLowerCase()

      if (status === 'completed') {
        completed.push(visit)
      } else if (status === 'pending') {
        // Check if pending visit is overdue (missed)
        if (visitDate < now) {
          missed.push(visit)
        } else {
          pending.push(visit)
        }
      } else if (status === 'missed' || status === 'cancelled') {
        missed.push(visit)
      }
    })

    // Sort each category by date
    pending.sort((a, b) => new Date(a.followv_date).getTime() - new Date(b.followv_date).getTime())
    completed.sort((a, b) => new Date(b.followv_date).getTime() - new Date(a.followv_date).getTime())
    missed.sort((a, b) => new Date(b.followv_date).getTime() - new Date(a.followv_date).getTime())

    return { pending, completed, missed }
  }, [mergedVisits])

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Pending</Badge>
      case 'missed':
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Missed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
    }
  }

  const VisitCard = ({ visit, isOverdue = false }: { visit: FollowUpVisit; isOverdue?: boolean }) => (
    <div className={`p-3 border rounded-lg transition-colors ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className={isOverdue ? "text-red-600" : "text-gray-600"} />
            <span className={`text-sm font-semibold ${isOverdue ? "text-red-700" : "text-gray-700"}`}>
              {formatDate(visit.followv_date)}
            </span>
            {isOverdue && (
              <AlertTriangle size={14} className="text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 ml-5">{visit.followv_description || "Follow-up visit"}</p>
        </div>
        {getStatusBadge(visit.followv_status)}
      </div>
      {visit.completed_at && (
        <div className="text-xs text-gray-500 ml-5 mt-1">
          Completed on: {formatDate(visit.completed_at)}
        </div>
      )}
      <div className="text-xs text-gray-400 ml-5 mt-1">
        ID: {visit.followv_id}
      </div>
    </div>
  )

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon size={40} className="mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Follow-up Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mergedVisits.length) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Follow-up Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Calendar} message="No follow-up visits scheduled" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 bg-white p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{categorizedVisits.pending.length}</p>
              </div>
              <Clock size={28} className="text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Completed</p>
                <p className="text-2xl font-bold text-green-600">{categorizedVisits.completed.length}</p>
              </div>
              <CheckCircle size={28} className="text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Missed</p>
                <p className="text-2xl font-bold text-red-600">{categorizedVisits.missed.length}</p>
              </div>
              <XCircle size={28} className="text-red-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Visit Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Visits */}
        <Card className="border border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-800">
              <Clock size={18} />
              Pending Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {categorizedVisits.pending.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categorizedVisits.pending.map(visit => (
                  <VisitCard key={visit.followv_id} visit={visit} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Clock} message="No pending visits" />
            )}
          </CardContent>
        </Card>

        {/* Completed Visits */}
        <Card className="border border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-md font-semibold flex items-center gap-2 text-green-800">
              <CheckCircle size={18} />
              Completed Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {categorizedVisits.completed.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categorizedVisits.completed.map(visit => (
                  <VisitCard key={visit.followv_id} visit={visit} />
                ))}
              </div>
            ) : (
              <EmptyState icon={CheckCircle} message="No completed visits" />
            )}
          </CardContent>
        </Card>

        {/* Missed Visits */}
        <Card className="border border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-md font-semibold flex items-center gap-2 text-red-800">
              <XCircle size={18} />
              Missed Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {categorizedVisits.missed.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categorizedVisits.missed.map(visit => (
                  <VisitCard key={visit.followv_id} visit={visit} isOverdue />
                ))}
              </div>
            ) : (
              <EmptyState icon={CheckCircle} message="No missed visits" />
            )}
          </CardContent>
        </Card>
        {/* Overall Combined List */}
        {/* <Card className="border border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-md font-semibold flex items-center gap-2 text-purple-800">
              <Calendar size={18} />
              All Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {mergedVisits.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mergedVisits
                  .slice()
                  .sort((a, b) => new Date(b.followv_date).getTime() - new Date(a.followv_date).getTime())
                  .map(visit => (
                    <VisitCard key={`all-${visit.followv_id}-${visit.followv_date}`} visit={visit} />
                  ))}
              </div>
            ) : (
              <EmptyState icon={Calendar} message="No follow-ups" />
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
