'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BedDouble, CalendarClock, DoorOpen, Minus, Plus, Send, Settings2, Star, UserRound } from 'lucide-react'
import { defaultPriorityTime, priorityTimeOptions } from '@/lib/dailyPlans/priorityTime'
import { isStayoverRoomType, roomTypeOptions } from '@/lib/roomTypes'
import { useUpdateRoomStatusMutation, useUpdateRoomTypeMutation } from '@/store/api/dailyPlanApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getDaysSinceCleanedLabel } from '@/lib/cleaningRecency'
import { buildWhatsAppAppLink, buildWhatsAppLink, normalizeWhatsAppChatLink } from '@/lib/whatsapp/buildLink'
import type { RoomWithStatus, CleaningStatus, RoomType } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Props {
  room: RoomWithStatus
  hasUnreadChange?: boolean
  whatsappEnabled: boolean
  whatsappChatLink: string
  whatsappPhone: string
  whatsappTemplate: string
  whatsappAllowAfterCleaned: boolean
  isOnline: boolean
}

const statusCycle: CleaningStatus[] = ['not_cleaned_yet', 'cleaned', 'not_needed']

const cardStatusStyles: Record<CleaningStatus, string> = {
  not_cleaned_yet: 'border-amber-200 bg-white shadow-[inset_5px_0_0_#f59e0b]',
  cleaned: 'border-emerald-200 bg-white shadow-[inset_5px_0_0_#10b981]',
  not_needed: 'border-slate-200 bg-slate-50 shadow-[inset_5px_0_0_#cbd5e1]',
}

export function RoomCard({
  room,
  hasUnreadChange = false,
  whatsappEnabled,
  whatsappChatLink,
  whatsappPhone,
  whatsappTemplate,
  whatsappAllowAfterCleaned,
  isOnline,
}: Props) {
  const t = useTranslations('board')
  const tCommon = useTranslations('common')
  const [updateStatus] = useUpdateRoomStatusMutation()
  const [updateRoomType, { isLoading: isSavingType }] = useUpdateRoomTypeMutation()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [draftRoomType, setDraftRoomType] = useState<RoomType>(room.roomType)
  const [draftPriority, setDraftPriority] = useState(room.priority)
  const [draftPriorityTime, setDraftPriorityTime] = useState(room.priorityTime ?? defaultPriorityTime)
  const [draftGuestCount, setDraftGuestCount] = useState(room.guestCount)
  const longPressTimeoutRef = useRef<number | null>(null)
  const chatLink = normalizeWhatsAppChatLink(whatsappChatLink)
  const whatsappMessage = whatsappTemplate.replace('{room}', room.roomNumber)
  const canUseWhatsAppFlow = whatsappEnabled && (!!chatLink || !!whatsappPhone)

  function openWhatsApp(markRoomAsCleaned: boolean) {
    if (chatLink) {
      void navigator.clipboard.writeText(whatsappMessage).catch(() => undefined)
      window.open(chatLink, '_blank', 'noopener,noreferrer')
      if (markRoomAsCleaned && room.status !== 'cleaned') {
        updateStatus({ id: room.dailyPlanRoomId, status: 'cleaned', sendMessageUsed: true })
      }
      return
    }

    const webLink = buildWhatsAppLink(whatsappPhone, whatsappTemplate, room.roomNumber)
    const appLink = buildWhatsAppAppLink(whatsappPhone, whatsappTemplate, room.roomNumber)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)

    if (isMobile) {
      window.location.href = appLink
      window.setTimeout(() => {
        window.location.href = webLink
      }, 800)
    } else {
      window.open(webLink, '_blank', 'noopener,noreferrer')
    }

    if (markRoomAsCleaned && room.status !== 'cleaned') {
      updateStatus({ id: room.dailyPlanRoomId, status: 'cleaned', sendMessageUsed: true })
    }
  }

  function cycleStatus() {
    if (!isOnline) return
    const current = statusCycle.indexOf(room.status)
    const next = statusCycle[(current + 1) % statusCycle.length]

    if (next === 'cleaned' && canUseWhatsAppFlow) {
      openWhatsApp(false)
    }

    updateStatus({ id: room.dailyPlanRoomId, status: next })
  }

  const statusLabels: Record<CleaningStatus, string> = {
    cleaned: t('cleaned'),
    not_cleaned_yet: t('notCleaned'),
    not_needed: t('notNeeded'),
  }

  const canSendWhatsApp =
    canUseWhatsAppFlow && (room.status !== 'cleaned' || whatsappAllowAfterCleaned)
  const roomTypeLabel = t(room.roomType)
  const RoomTypeIcon = room.roomType === 'checkout' ? DoorOpen : BedDouble

  function openEditor() {
    setDraftRoomType(room.roomType)
    setDraftPriority(room.priority)
    setDraftPriorityTime(room.priorityTime ?? defaultPriorityTime)
    setDraftGuestCount(room.guestCount)
    setIsEditorOpen(true)
  }

  function clearLongPressTimer() {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }

  function handlePointerDown() {
    if (!isOnline) return
    clearLongPressTimer()
    longPressTimeoutRef.current = window.setTimeout(() => {
      openEditor()
      longPressTimeoutRef.current = null
    }, 450)
  }

  function handleRoomTypeChange(nextType: RoomType) {
    setDraftRoomType(nextType)
    if (isStayoverRoomType(nextType)) {
      setDraftPriority(false)
      setDraftPriorityTime(defaultPriorityTime)
    }
  }

  function handlePriorityToggle() {
    setDraftPriority((prev) => {
      const next = !prev
      if (next) {
        setDraftPriorityTime((current) => current || defaultPriorityTime)
      }
      return next
    })
  }

  async function handleSaveChanges() {
    await updateRoomType({
      id: room.dailyPlanRoomId,
      roomType: draftRoomType,
      priority: draftRoomType === 'checkout' ? draftPriority : false,
      priorityTime: draftRoomType === 'checkout' && draftPriority ? draftPriorityTime : null,
      guestCount: draftGuestCount,
    }).unwrap()
    setIsEditorOpen(false)
  }

  const isBigStayover = room.roomType === 'big-stayover'
  const stayLengthLabel =
    room.daysSinceLastCheckout !== null && room.daysSinceLastCheckout !== undefined
      ? getDaysSinceCleanedLabel(room.daysSinceLastCheckout)
      : null

  return (
    <>
      <div
        className={cn(
          'relative grid min-h-24 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-xl border py-3 pl-4 pr-3 shadow-sm transition-colors',
          cardStatusStyles[room.status],
          !isOnline && 'opacity-70',
          isBigStayover && 'border-amber-400 bg-amber-50 shadow-[inset_5px_0_0_#d97706,0_8px_24px_-16px_rgba(245,158,11,0.85)]',
          room.priority && 'ring-1 ring-orange-200'
        )}
      >
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={openEditor}
          disabled={!isOnline}
          className="group/room-number flex min-w-0 items-start gap-1 self-start rounded-lg pr-1 text-left text-3xl font-black leading-none text-slate-950 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={`${t('editRoom')} ${room.roomNumber}`}
          title={t('editHint')}
        >
          <span className="tabular-nums">{room.roomNumber}</span>
          <Settings2 className="mt-0.5 h-3.5 w-3.5 text-slate-300 transition-colors group-hover/room-number:text-emerald-700" aria-hidden="true" />
          {hasUnreadChange && (
            <span className="mt-1.5 block h-2.5 w-2.5 rounded-full bg-red-500" aria-label={t('newUpdates')} />
          )}
        </button>
        <div
          className="min-w-0 py-0.5"
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimer}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
        >
          <div className="grid min-w-0 gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-100 px-2 text-xs font-bold text-slate-700">
                <RoomTypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {roomTypeLabel}
              </span>
              {room.priority && (
                <span className="inline-flex h-7 items-center gap-1 rounded-md bg-orange-100 px-2 text-xs font-black text-orange-800">
                  <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  {t('priorityUntil', { time: room.priorityTime ?? defaultPriorityTime })}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {room.guestCount >= 1 && (
                <span
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-emerald-50 px-2 text-xs font-bold text-emerald-800"
                  aria-label={t('guestCount', { count: room.guestCount })}
                  title={t('guestCount', { count: room.guestCount })}
                >
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {room.guestCount}
                </span>
              )}
              {stayLengthLabel && (
                <span
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-sky-50 px-2 text-xs font-bold text-sky-800"
                  title={t('lastCheckout')}
                  aria-label={t('stayLength', { days: stayLengthLabel })}
                >
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t('stayLengthShort', { days: stayLengthLabel })}
                </span>
              )}
              {room.updatedBy && (
                <span className="min-w-0 truncate text-xs font-medium text-slate-400">
                  {t('updatedBy')} {room.updatedBy}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 self-center">
          {canSendWhatsApp && (
            <button
              type="button"
              onClick={() => openWhatsApp(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title={t('openWhatsApp')}
              aria-label={`${t('openWhatsApp')} ${room.roomNumber}`}
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={cycleStatus}
            disabled={!isOnline}
            className="min-h-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed"
            aria-label={`${room.roomNumber}: ${statusLabels[room.status]}`}
          >
            <StatusBadge status={room.status} label={statusLabels[room.status]} />
          </button>
        </div>
      </div>
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-slate-50">
          <SheetHeader>
            <SheetTitle className="text-left text-xl font-black text-slate-950">
              {t('editRoom')} {room.roomNumber}
            </SheetTitle>
            <SheetDescription className="text-left">{t('editHint')}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700">{t('roomType')}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {roomTypeOptions.map((type) => {
                  const OptionIcon = type === 'checkout' ? DoorOpen : BedDouble
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleRoomTypeChange(type)}
                      className={cn(
                        'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                        draftRoomType === type
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600'
                      )}
                    >
                      <OptionIcon className="h-4 w-4" aria-hidden="true" />
                      {t(type)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700">{t('guests')}</p>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDraftGuestCount((n) => Math.max(1, n - 1))}
                  disabled={draftGuestCount <= 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-30"
                  aria-label={t('decreaseGuests')}
                >
                  <Minus className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="flex-1 text-center text-2xl font-black tabular-nums text-slate-950">
                  {draftGuestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setDraftGuestCount((n) => Math.min(5, n + 1))}
                  disabled={draftGuestCount >= 5}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-30"
                  aria-label={t('increaseGuests')}
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePriorityToggle}
              disabled={draftRoomType !== 'checkout'}
              className={cn(
                'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
                draftRoomType !== 'checkout' && 'cursor-not-allowed border-slate-100 bg-white text-slate-300',
                draftRoomType === 'checkout' && draftPriority && 'border-orange-300 bg-orange-100 text-orange-800 shadow-sm',
                draftRoomType === 'checkout' && !draftPriority && 'border-slate-200 bg-white text-slate-600'
              )}
            >
              <Star className={cn('h-4 w-4', draftPriority && 'fill-current')} aria-hidden="true" />
              {draftPriority ? t('priorityOn') : t('priorityOff')}
            </button>
            {draftRoomType === 'checkout' && draftPriority && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">{t('priorityTime')}</p>
                <select
                  value={draftPriorityTime}
                  onChange={(e) => setDraftPriorityTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {priorityTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <SheetFooter className="gap-2 bg-slate-50">
            <Button
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSavingType}
              className="h-11 rounded-xl bg-white"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSavingType}
              className="h-11 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {isSavingType ? tCommon('loading') : t('saveChanges')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
