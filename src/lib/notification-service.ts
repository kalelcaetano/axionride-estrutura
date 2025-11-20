// AxionRide - Serviço de Notificações

import type { Notification } from './types';
import { createNotification } from './db';
import { generateId } from './fleet-utils';

export type NotificationType = 'alert' | 'reminder' | 'info' | 'sync';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  metadata?: {
    motorcycleId?: string;
    renterId?: string;
    syncType?: 'km_update' | 'alert_new' | 'maintenance_update' | 'renter_assigned';
  };
}

/**
 * Envia notificação para usuário
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<Notification> {
  const notification = await createNotification({
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    isRead: false,
    actionUrl: payload.actionUrl,
    metadata: payload.metadata,
  });

  // Em produção, integrar com:
  // - Firebase Cloud Messaging (FCM)
  // - OneSignal
  // - Pusher
  // - WebSockets para notificações em tempo real

  return notification;
}

/**
 * Notifica sobre novo alerta de manutenção
 */
export async function notifyMaintenanceAlert(
  userId: string,
  motorcycleId: string,
  alertTitle: string,
  alertMessage: string
): Promise<void> {
  await sendNotification({
    userId,
    title: `⚠️ ${alertTitle}`,
    message: alertMessage,
    type: 'alert',
    actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType: 'alert_new',
    },
  });
}

/**
 * Notifica sobre atualização de km
 */
export async function notifyKmUpdate(
  userId: string,
  motorcycleId: string,
  oldKm: number,
  newKm: number,
  updatedBy: string
): Promise<void> {
  const kmDiff = newKm - oldKm;

  await sendNotification({
    userId,
    title: '📊 Quilometragem Atualizada',
    message: `A quilometragem foi atualizada de ${oldKm}km para ${newKm}km (+${kmDiff}km)`,
    type: 'sync',
    actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType: 'km_update',
    },
  });
}

/**
 * Notifica locatário sobre atribuição de moto
 */
export async function notifyRenterAssigned(
  renterId: string,
  motorcycleId: string,
  motorcycleName: string
): Promise<void> {
  await sendNotification({
    userId: renterId,
    title: '🏍️ Moto Atribuída',
    message: `Você foi atribuído à moto ${motorcycleName}. Agora você pode acompanhar e atualizar informações.`,
    type: 'info',
    actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
    metadata: {
      motorcycleId,
      renterId,
      syncType: 'renter_assigned',
    },
  });
}

/**
 * Notifica administrador sobre atualização do locatário
 */
export async function notifyAdminOfRenterUpdate(
  adminId: string,
  motorcycleId: string,
  motorcycleName: string,
  updateType: string
): Promise<void> {
  await sendNotification({
    userId: adminId,
    title: '🔄 Atualização da Frota',
    message: `O locatário atualizou ${updateType} da moto ${motorcycleName}`,
    type: 'sync',
    actionUrl: `/fleet/motorcycle/${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType: 'maintenance_update',
    },
  });
}

/**
 * Notifica sobre manutenção vencida
 */
export async function notifyMaintenanceOverdue(
  userId: string,
  motorcycleId: string,
  maintenanceType: string
): Promise<void> {
  await sendNotification({
    userId,
    title: '🚨 Manutenção VENCIDA',
    message: `A ${maintenanceType} está vencida! Agende o serviço o quanto antes.`,
    type: 'alert',
    actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType: 'alert_new',
    },
  });
}

/**
 * Notifica sobre manutenção próxima
 */
export async function notifyMaintenanceUpcoming(
  userId: string,
  motorcycleId: string,
  maintenanceType: string,
  kmRemaining: number
): Promise<void> {
  await sendNotification({
    userId,
    title: '⏰ Manutenção Próxima',
    message: `A ${maintenanceType} está próxima! Faltam ${kmRemaining}km.`,
    type: 'reminder',
    actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType: 'alert_new',
    },
  });
}

/**
 * Envia notificação em lote para múltiplos usuários
 */
export async function sendBulkNotifications(
  userIds: string[],
  payload: Omit<NotificationPayload, 'userId'>
): Promise<Notification[]> {
  const notifications: Notification[] = [];

  for (const userId of userIds) {
    const notification = await sendNotification({
      ...payload,
      userId,
    });
    notifications.push(notification);
  }

  return notifications;
}

/**
 * Notifica administrador e locatário sobre sincronização
 */
export async function notifyFleetSync(
  adminId: string,
  renterId: string | undefined,
  motorcycleId: string,
  syncType: 'km_update' | 'alert_new' | 'maintenance_update',
  details: string
): Promise<void> {
  // Notifica administrador
  await sendNotification({
    userId: adminId,
    title: '🔄 Sincronização da Frota',
    message: details,
    type: 'sync',
    actionUrl: `/fleet/motorcycle/${motorcycleId}`,
    metadata: {
      motorcycleId,
      syncType,
    },
  });

  // Notifica locatário (se existir)
  if (renterId) {
    await sendNotification({
      userId: renterId,
      title: '🔄 Atualização Sincronizada',
      message: details,
      type: 'sync',
      actionUrl: `/dashboard?motorcycle=${motorcycleId}`,
      metadata: {
        motorcycleId,
        syncType,
      },
    });
  }
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  // Implementar com db.updateNotification quando necessário
  console.log(`Notification ${notificationId} marked as read`);
}

/**
 * Marca todas as notificações de um usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  // Implementar com db quando necessário
  console.log(`All notifications for user ${userId} marked as read`);
}
