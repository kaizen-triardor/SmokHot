'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface TourEvent {
  id: string
  date: string
  event: string
  location: string
  time?: string
  highlight?: string
  status: 'upcoming' | 'past'
  description?: string
}

export default function TurnejaAdminPage() {
  const [events, setEvents] = useState<TourEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TourEvent | null>(null)

  // Mock data - this would normally come from your database
  useEffect(() => {
    const mockEvents: TourEvent[] = [
      {
        id: '1',
        date: '2026-03-25',
        event: 'Beogradska pijaca',
        location: 'Kalenić pijaca, Beograd',
        time: '09:00 - 15:00',
        status: 'upcoming',
        description: 'Promocija svih sosova na gradskoj pijaci'
      },
      {
        id: '2',
        date: '2026-04-02',
        event: 'Food Fest Novi Sad',
        location: 'Dunavski park, Novi Sad',
        time: '12:00 - 22:00',
        status: 'upcoming',
        description: 'Veliki food festival sa lokalna i međunarodnom kuhinjom'
      },
      {
        id: '3',
        date: '2026-03-10',
        event: 'Zemun food market',
        location: 'Gardoš, Zemun',
        highlight: 'Prodali smo 50+ flašica za 4 sata!',
        status: 'past',
        description: 'Odličan odziv na Zemunskom marketu'
      },
      {
        id: '4',
        date: '2026-02-28',
        event: 'Craft beer fest',
        location: 'Dorćol, Beograd',
        highlight: 'Jackal sos bio hit sa craft pivom',
        status: 'past',
        description: 'Savršeno uparivanje sa craft pivima'
      }
    ]
    setEvents(mockEvents)
  }, [])

  const handleSubmit = (eventData: Omit<TourEvent, 'id'>) => {
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...eventData, id: editingEvent.id }
          : event
      ))
    } else {
      const newEvent = { ...eventData, id: Date.now().toString() }
      setEvents(prev => [...prev, newEvent])
    }
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj događaj?')) {
      setEvents(prev => prev.filter(event => event.id !== id))
    }
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastEvents = events.filter(e => e.status === 'past').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upravljanje turnejom</h1>
          <p className="mt-2 text-white/70">Dodaj i uređuj događaje na kojima predstavljate sosove</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-xl border-2 border-ember-500 bg-ember-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj događaj
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div>
          <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
            <CalendarIcon className="h-6 w-6 text-ember-500" />
            Naredni događaji ({upcomingEvents.length})
          </h2>
          
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-surface/50 p-8 text-center">
                <p className="text-white/50">Nema zakazanih događaja</p>
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
            Prošli događaji ({pastEvents.length})
          </h2>
          
          <div className="space-y-4">
            {pastEvents.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-surface/50 p-8 text-center">
                <p className="text-white/50">Nema prošlih događaja</p>
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
            <div className="text-sm text-white/70">Ukupno događaja</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-500">{upcomingEvents.length}</div>
            <div className="text-sm text-white/70">Naredni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{pastEvents.length}</div>
            <div className="text-sm text-white/70">Završeni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {pastEvents.filter(e => e.highlight).length}
            </div>
            <div className="text-sm text-white/70">Sa highlights</div>
          </div>
        </div>
      </div>
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
          <h3 className="text-lg font-bold text-white">{event.event}</h3>
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
  onSubmit: (data: Omit<TourEvent, 'id'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    date: event?.date || '',
    event: event?.event || '',
    location: event?.location || '',
    time: event?.time || '',
    highlight: event?.highlight || '',
    status: event?.status || 'upcoming' as const,
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
          {event ? 'Uredi događaj' : 'Dodaj novi događaj'}
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
            <label className="mb-2 block text-sm font-bold text-white">Naziv događaja *</label>
            <input
              type="text"
              value={formData.event}
              onChange={e => setFormData(prev => ({ ...prev, event: e.target.value }))}
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
              placeholder="Kalenić pijaca, Beograd"
              required
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'upcoming' | 'past' }))}
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
            >
              <option value="upcoming">Naredni događaj</option>
              <option value="past">Prošli događaj</option>
            </select>
          </div>

          {formData.status === 'past' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Highlight (za prošle događaje)</label>
              <input
                type="text"
                value={formData.highlight}
                onChange={e => setFormData(prev => ({ ...prev, highlight: e.target.value }))}
                placeholder="Prodali smo 50+ flašica za 4 sata!"
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Opis</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Kratak opis događaja..."
              rows={3}
              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
            >
              {event ? 'Sačuvaj izmene' : 'Dodaj događaj'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border-2 border-white/20 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}