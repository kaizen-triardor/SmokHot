'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface TourEvent {
  id: string
  title: string
  location: string
  date: string
  time: string
  status: 'upcoming' | 'past' | 'cancelled'
  highlight: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export default function TurnejaAdminPage() {
  const [events, setEvents] = useState<TourEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TourEvent | null>(null)

  const getToken = () => localStorage.getItem('admin-token') || ''

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/turneja', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSubmit = async (formData: {
    title: string
    location: string
    date: string
    time: string
    status: string
    highlight: string
    description: string
  }) => {
    try {
      const url = editingEvent
        ? `/api/admin/turneja/${editingEvent.id}`
        : '/api/admin/turneja'
      const method = editingEvent ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          date: new Date(formData.date).toISOString(),
          time: formData.time,
          status: formData.status,
          highlight: formData.highlight || null,
          description: formData.description || null
        })
      })

      if (res.ok) {
        setShowForm(false)
        setEditingEvent(null)
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovaj dogadjaj?')) return

    try {
      const res = await fetch(`/api/admin/turneja/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const upcomingEvents = events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastEvents = events
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upravljanje turnejom</h1>
          <p className="mt-2 text-white/70">Dodaj i uredjuj dogadjaje na kojima predstavljate sosove</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-xl border-2 border-ember-500 bg-ember-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj dogadjaj
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
            <p className="text-white/60">Ucitavanje dogadjaja...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upcoming Events */}
            <div>
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                <CalendarIcon className="h-6 w-6 text-ember-500" />
                Naredni dogadjaji ({upcomingEvents.length})
              </h2>

              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-surface/50 p-8 text-center">
                    <p className="text-white/50">Nema zakazanih dogadjaja</p>
                  </div>
                ) : (
                  upcomingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => {
                        setEditingEvent(event)
                        setShowForm(true)
                      }}
                      onDelete={() => handleDelete(event.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Past Events */}
            <div>
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                <MapPinIcon className="h-6 w-6 text-warning-500" />
                Prosli dogadjaji ({pastEvents.length})
              </h2>

              <div className="space-y-4">
                {pastEvents.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-surface/50 p-8 text-center">
                    <p className="text-white/50">Nema proslih dogadjaja</p>
                  </div>
                ) : (
                  pastEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => {
                        setEditingEvent(event)
                        setShowForm(true)
                      }}
                      onDelete={() => handleDelete(event.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-surface/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Statistike</h3>
            <div className="grid gap-6 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-ember-500">{events.length}</div>
                <div className="text-sm text-white/70">Ukupno dogadjaja</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-500">{upcomingEvents.length}</div>
                <div className="text-sm text-white/70">Naredni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{pastEvents.length}</div>
                <div className="text-sm text-white/70">Zavrseni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {pastEvents.filter(e => e.highlight).length}
                </div>
                <div className="text-sm text-white/70">Sa highlights</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EventCard({
  event,
  onEdit,
  onDelete
}: {
  event: TourEvent
  onEdit: () => void
  onDelete: () => void
}) {
  const isUpcoming = event.status === 'upcoming'
  const formattedDate = new Date(event.date).toLocaleDateString('sr-RS', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="rounded-xl border border-white/10 bg-surface/50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] ${
              isUpcoming
                ? 'bg-ember-500/20 text-ember-500'
                : 'bg-warning-500/20 text-warning-500'
            }`}>
              {formattedDate}
            </span>
            {event.time && (
              <span className="text-xs font-medium text-white/50">
                {event.time}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white">{event.title}</h3>
          <p className="mt-1 text-sm text-white/70">{event.location}</p>
          {event.description && (
            <p className="mt-2 text-sm text-white/60">{event.description}</p>
          )}
          {event.highlight && (
            <p className="mt-2 text-sm font-bold text-warning-400">{event.highlight}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg bg-ember-500/20 p-2 text-ember-400 transition hover:bg-ember-500 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EventForm({
  event,
  onSubmit,
  onCancel
}: {
  event: TourEvent | null
  onSubmit: (data: {
    title: string
    location: string
    date: string
    time: string
    status: string
    highlight: string
    description: string
  }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    location: event?.location || '',
    date: event ? event.date.split('T')[0] : '',
    time: event?.time || '',
    status: event?.status || 'upcoming',
    highlight: event?.highlight || '',
    description: event?.description || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-surface p-6">
        <h2 className="mb-6 text-xl font-bold text-white">
          {event ? 'Uredi dogadjaj' : 'Dodaj novi dogadjaj'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Datum *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Vreme</label>
              <input
                type="text"
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                placeholder="09:00 - 15:00"
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Naziv dogadjaja *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Beogradska pijaca"
              required
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Lokacija *</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Kalenic pijaca, Beograd"
              required
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'upcoming' | 'past' | 'cancelled' }))}
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
            >
              <option value="upcoming">Naredni dogadjaj</option>
              <option value="past">Prosli dogadjaj</option>
              <option value="cancelled">Otkazan</option>
            </select>
          </div>

          {formData.status === 'past' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Highlight (za prosle dogadjaje)</label>
              <input
                type="text"
                value={formData.highlight}
                onChange={e => setFormData(prev => ({ ...prev, highlight: e.target.value }))}
                placeholder="Prodali smo 50+ flasica za 4 sata!"
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Opis</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Kratak opis dogadjaja..."
              rows={3}
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
            >
              {event ? 'Sacuvaj izmene' : 'Dodaj dogadjaj'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border-2 border-white/20 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
            >
              Otkazi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
