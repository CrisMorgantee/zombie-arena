// Utilitários de colisão usados pelo Game.

/** Centro de uma entidade retangular (position + width/height). */
export function centerOf(entity) {
  return {
    x: entity.position.x + entity.width / 2,
    y: entity.position.y + entity.height / 2,
  };
}

/** Colisão círculo × círculo. */
export function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Colisão segmento × círculo (varredura do projétil de (x0,y0) a (x1,y1)).
 * Evita "tunneling": balas rápidas não atravessam alvos entre frames.
 * Retorna true se o segmento intersecta o círculo de centro (cx,cy) e raio r.
 */
export function segmentCircleIntersect(x0, y0, x1, y1, cx, cy, r) {
  const ex = x1 - x0;
  const ey = y1 - y0;
  const fx = x0 - cx;
  const fy = y0 - cy;

  const a = ex * ex + ey * ey;
  if (a === 0) return circlesOverlap(x0, y0, 0, cx, cy, r); // segmento degenerado

  // Resolve |P(t) - C|^2 = r^2  com  P(t) = P0 + t*E,  t em [0, 1]
  const b = 2 * (fx * ex + fy * ey);
  const c = fx * fx + fy * fy - r * r;

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  // Intersecta se algum t cai dentro do segmento
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

/** Colisão retângulo × retângulo (AABB). */
export function rectsOverlap(a, b) {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  );
}
