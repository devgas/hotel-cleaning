'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { defaultPriorityTime, priorityTimeOptions } from '@/lib/dailyPlans/priorityTime'
import { isStayoverRoomType, roomTypeOptions } from '@/lib/roomTypes'
import { useUpdateRoomStatusMutation, useUpdateRoomTypeMutation } from '@/store/api/dailyPlanApi'
import { StatusBadge } from '@/components/common/StatusBadge'
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
  whatsappEnabled: boolean
  whatsappChatLink: string
  whatsappPhone: string
  whatsappTemplate: string
  whatsappAllowAfterCleaned: boolean
  isOnline: boolean
}

const statusCycle: CleaningStatus[] = ['not_cleaned_yet', 'cleaned', 'not_needed']

export function RoomCard({
  room,
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

  const roomTypeLabel = t(room.roomType)
  const canSendWhatsApp =
    canUseWhatsAppFlow && (room.status !== 'cleaned' || whatsappAllowAfterCleaned)

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

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border px-3 py-2.5 flex items-center gap-3 shadow-sm',
          room.priority && 'border-l-4 border-l-orange-400',
          isBigStayover ? 'border-amber-400 bg-amber-100/90 shadow-[0_8px_24px_-16px_rgba(245,158,11,0.85)]' : 'bg-white'
        )}
      >
        {isBigStayover && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-2 bg-amber-500"
          />
        )}
        <div
          className={cn('flex-1 min-w-0', isBigStayover && 'pl-2')}
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimer}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{room.roomNumber}</span>
            {room.priority && (
              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                ★ {room.priorityTime ?? defaultPriorityTime}
              </span>
            )}
            {room.guestCount >= 1 && (
              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                👤 {room.guestCount}
              </span>
            )}
            <span
              className={cn(
                'text-xs px-2 py-1 rounded font-medium',
                isBigStayover
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-400'
              )}
            >
              {roomTypeLabel}
            </span>
          </div>
          {room.updatedBy && (
            <p className="text-xs text-gray-400 mt-0.5">
              {t('updatedBy')} {room.updatedBy}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canSendWhatsApp && (
            <button onClick={() => openWhatsApp(true)} className="text-green-600 text-lg" title={t('openWhatsApp')}>
              💬
            </button>
          )}
          <button onClick={cycleStatus} disabled={!isOnline}>
            <StatusBadge status={room.status} label={statusLabels[room.status]} />
          </button>
        </div>
      </div>
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t('editRoom')}</SheetTitle>
            <SheetDescription>{room.roomNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{t('roomType')}</p>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
                {roomTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleRoomTypeChange(type)}
                    className={cn(
                      'flex-1 px-3 py-2',
                      draftRoomType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                    )}
                  >
                    {t(type)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Guests</p>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                <button
                  onClick={() => setDraftGuestCount((n) => Math.max(1, n - 1))}
                  disabled={draftGuestCount <= 1}
                  className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-lg disabled:opacity-30"
                >
                  −
                </button>
                <span className="flex-1 text-center text-xl font-bold text-gray-900">
                  {draftGuestCount}
                </span>
                <button
                  onClick={() => setDraftGuestCount((n) => Math.min(5, n + 1))}
                  disabled={draftGuestCount >= 5}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handlePriorityToggle}
              disabled={draftRoomType !== 'checkout'}
              className={cn(
                'w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                draftRoomType !== 'checkout' && 'cursor-not-allowed border-gray-100 text-gray-300',
                draftRoomType === 'checkout' && draftPriority && 'border-orange-300 bg-orange-100 text-orange-700',
                draftRoomType === 'checkout' && !draftPriority && 'border-gray-200 text-gray-600'
              )}
            >
              ★ {t('priority')}
            </button>
            {draftRoomType === 'checkout' && draftPriority && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('priorityTime')}</p>
                <select
                  value={draftPriorityTime}
                  onChange={(e) => setDraftPriorityTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)} disabled={isSavingType}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSavingType}>
              {isSavingType ? '...' : t('saveChanges')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
