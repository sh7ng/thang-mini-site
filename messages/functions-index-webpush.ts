import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();
const db = getFirestore();
const REGION = "asia-southeast1";

async function sendToUids(familyId: string, title: string, body: string, recipientUids: string[], excludeUid?: string, kind: "event" | "message" = "event") {
  const snap = await db.collection("families").doc(familyId).collection("members").get();
  const tokensByLanguage = new Map<string, string[]>();
  snap.docs
    .filter((member) => member.id !== excludeUid)
    .filter((member) => recipientUids.length === 0 || recipientUids.includes(member.id))
    .forEach((member) => {
      // Keep Android fcmToken intact and also include the separate browser Web Push token.
      const tokens = [member.get("fcmToken"), member.get("webFcmToken")]
        .filter((token): token is string => typeof token === "string" && token.length > 0);
      if (tokens.length === 0) return;
      const language = member.get("language") === "en" || member.get("language") === "zh" ? member.get("language") as string : "vi";
      const group = tokensByLanguage.get(language) ?? [];
      group.push(...tokens);
      tokensByLanguage.set(language, group);
    });

  for (const [language, tokens] of tokensByLanguage) {
    const localizedTitle = kind === "message"
      ? language === "en" ? title.replace(/^Tin nhắn từ /, "Message from ")
        : language === "zh" ? title.replace(/^Tin nhắn từ /, "来自") + "的消息"
        : title
      : title;
    await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: localizedTitle, body },
      data: { familyId, title: localizedTitle, body, kind },
      android: { notification: { channelId: kind === "message" ? "family_messages_v3" : "family_events_v2", sound: "default", priority: "high" } },
      webpush: { notification: { icon: "https://bosua.site/messages/icon.svg", badge: "https://bosua.site/messages/icon.svg" }, fcmOptions: { link: "https://bosua.site/messages/" } }
    });
  }
}

export const eventCreated = onDocumentCreated({ document: "families/{familyId}/events/{eventId}", region: REGION }, async (event) => {
  const data = event.data?.data(); if (!data) return;
  const recipients = Array.isArray(data.notifyToUids) ? data.notifyToUids.filter((v: unknown): v is string => typeof v === "string") : [];
  await sendToUids(event.params.familyId, "Lịch gia đình mới", `${data.title ?? "Một lịch mới"} đã được thêm`, recipients, data.createdBy);
});

export const eventUpdated = onDocumentUpdated({ document: "families/{familyId}/events/{eventId}", region: REGION }, async (event) => {
  const before = event.data?.before.data(); const data = event.data?.after.data(); if (!data) return;
  const recipients = Array.isArray(data.notifyToUids) ? data.notifyToUids.filter((v: unknown): v is string => typeof v === "string") : [];
  if (before && before.completed !== data.completed) {
    await sendToUids(event.params.familyId, "Cập nhật lịch gia đình", `${data.title ?? "Lịch nhắc"} ${data.completed ? "đã hoàn thành" : "đã được mở lại"}`, recipients, data.createdBy);
  } else {
    await sendToUids(event.params.familyId, "Lịch gia đình thay đổi", `${data.title ?? "Lịch"} vừa được cập nhật`, recipients, data.createdBy);
  }
});

export const eventDeleted = onDocumentDeleted({ document: "families/{familyId}/events/{eventId}", region: REGION }, async (event) => {
  const data = event.data?.data(); if (!data) return;
  // Family-wide deletion removes many event documents; do not send one push per deleted event.
  const family = await db.collection("families").doc(event.params.familyId).get();
  if (!family.exists || family.get("deleting") === true || family.get("deleted") === true) return;
  const recipients = Array.isArray(data.notifyToUids) ? data.notifyToUids.filter((v: unknown): v is string => typeof v === "string") : [];
  await sendToUids(event.params.familyId, "Lịch gia đình đã xóa", `${data.title ?? "Một lịch"} đã bị xóa`, recipients, data.createdBy);
});

export const messageCreated = onDocumentCreated({ document: "families/{familyId}/messages/{messageId}", region: REGION }, async (event) => {
  const data = event.data?.data(); if (!data) return;
  const recipients = Array.isArray(data.recipientUids) ? data.recipientUids.filter((v: unknown): v is string => typeof v === "string") : [];
  const sender = typeof data.senderName === "string" ? data.senderName : "Thành viên";
  const body = typeof data.text === "string" ? data.text.slice(0, 180) : "Bạn có tin nhắn mới";
  await sendToUids(event.params.familyId, `Tin nhắn từ ${sender}`, body, recipients, data.senderUid, "message");
});
