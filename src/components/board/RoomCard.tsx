'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
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
    if (nextType === 'stayover') {
      setDraftPriority(false)
    }
  }

  async function handleSaveChanges() {
    await updateRoomType({
      id: room.dailyPlanRoomId,
      roomType: draftRoomType,
      priority: draftPriority,
    }).unwrap()
    setIsEditorOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3',
          room.priority && 'border-l-4 border-l-orange-400'
        )}
      >
        <div
          className="flex-1 min-w-0"
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimer}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{room.roomNumber}</span>
            {room.priority && (
              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">★</span>
            )}
            <span className="text-xs text-gray-400">{roomTypeLabel}</span>
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
                {(['checkout', 'stayover'] as RoomType[]).map((type) => (
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
            <button
              onClick={() => setDraftPriority((prev) => !prev)}
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
