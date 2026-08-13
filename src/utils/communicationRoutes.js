export const COMMUNICATION_LIST_PATHS = {
  announcement: '/announcements',
  circular: '/circulars',
  notification: '/communications/notifications',
}

export function getCommunicationListPath(category) {
  return COMMUNICATION_LIST_PATHS[category] || '/communications/messages'
}

export function getCommunicationComposePath(category = 'announcement') {
  return `/communications/messages/new?category=${category}`
}

export const COMMUNICATION_CATEGORY_META = {
  announcement: {
    title: 'Announcements',
    subtitle: 'School-wide notices for students, parents, and staff',
    queryKey: 'announcements',
    compose: {
      pageTitle: 'New announcement',
      pageTitleEdit: 'Edit announcement',
      pageSubtitle: 'Craft a school-wide notice and deliver it across email, SMS, WhatsApp, or push.',
      contentTitle: 'Announcement content',
      contentDescription: 'Write the notice your school community will receive.',
      livePreviewTitle: 'Live preview',
      livePreviewDescription: 'See how your announcement will appear to recipients.',
      titlePlaceholder: 'e.g. Annual day celebration — Friday schedule',
      bodyPlaceholder: 'Share the full announcement details, dates, and any action items…',
      emptyTitle: 'Your announcement title',
      emptyBody: 'Write your message here. Recipients will see this content across the channels you select.',
      reachDescription: 'Estimate how many users will receive this announcement.',
    },
  },
  circular: {
    title: 'Circulars',
    subtitle: 'Official circulars and formal notices',
    queryKey: 'circulars',
    compose: {
      pageTitle: 'New circular',
      pageTitleEdit: 'Edit circular',
      pageSubtitle: 'Publish an official circular or formal notice for your school community.',
      contentTitle: 'Circular content',
      contentDescription: 'Write the official circular text that will be issued to recipients.',
      livePreviewTitle: 'Live preview',
      livePreviewDescription: 'See how your circular will appear to recipients.',
      titlePlaceholder: 'e.g. Holiday schedule circular — Term II',
      bodyPlaceholder: 'Include the circular reference, dates, instructions, and any compliance details…',
      emptyTitle: 'Your circular title',
      emptyBody: 'Write the circular content here. Recipients will receive it on the channels you select.',
      reachDescription: 'Estimate how many users will receive this circular.',
    },
  },
  notification: {
    title: 'Targeted Notifications',
    subtitle: 'Focused notifications for specific audiences',
    queryKey: 'communication-notifications',
    compose: {
      pageTitle: 'New notification',
      pageTitleEdit: 'Edit notification',
      pageSubtitle: 'Send a targeted notification to a specific audience via push, SMS, email, or WhatsApp.',
      contentTitle: 'Notification content',
      contentDescription: 'Write the short, focused message your selected audience will receive.',
      livePreviewTitle: 'Live preview',
      livePreviewDescription: 'See how your notification will appear to recipients.',
      titlePlaceholder: 'e.g. Parent–teacher meeting reminder',
      bodyPlaceholder: 'Keep it concise — key details, date/time, and what action is needed…',
      emptyTitle: 'Your notification title',
      emptyBody: 'Write the notification message here. Keep it brief and actionable for recipients.',
      reachDescription: 'Estimate how many users will receive this notification.',
    },
  },
}
