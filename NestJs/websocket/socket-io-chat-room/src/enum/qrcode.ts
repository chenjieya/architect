export enum QRCODE_STATUS {
  PENDING = 'pending', // 等待扫描
  SCANNED = 'scanned', // 已扫描
  CONFIRMED = 'confirmed', // 已确认
  EXPIRED = 'expired', // 已过期
  CANCELLED = 'cancelled', // 已取消
}
