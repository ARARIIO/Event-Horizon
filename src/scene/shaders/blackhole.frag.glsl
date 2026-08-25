precision highp float;

uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uHot;
uniform float uT;
uniform float uAz;
uniform float uEl;
uniform float uZoom;
uniform float uGlow;
uniform float uGrain;
uniform float uDense;
uniform float uFlash;
uniform float uSteps;
uniform float uFlare;
uniform float uFlareA;
uniform float uHotI;
uniform float uStars;

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.31, 289.07))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 fq = fract(p); fq = fq * fq * (3.0 - 2.0 * fq);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, fq.x), mix(c, d, fq.x), fq.y);
}
float fbm(vec2 p){ return 0.55 * vnoise(p) + 0.28 * vnoise(p * 2.17 + 11.3) + 0.17 * vnoise(p * 4.31 + 41.7); }
vec3 starLayer(vec3 d, vec2 dens, float pw, float amp, float sd){
  float lat = asin(clamp(d.y, -1.0, 1.0));
  vec2 sph = vec2(atan(d.z, d.x) * 0.1591 + 0.5, lat * 0.3183 + 0.5);
  vec2 g = sph * dens;
  vec2 c = floor(g); vec2 fr = fract(g) - 0.5;
  vec2 jit = vec2(hash(c + sd + 7.1), hash(c + sd + 13.3)) - 0.5;
  vec2 dv = fr - jit * 0.68;
  float ax = (6.2832 / dens.x) * max(0.15, cos(lat));
  float ay = 3.1416 / dens.y;
  float ang = length(vec2(dv.x * ax, dv.y * ay));
  float h = hash(c + sd);
  float mag = pow(hash(c + sd + 3.7), pw);
  float sz = 0.0013 + mag * 0.0022;
  float core = exp(-pow(ang / sz, 2.0));
  float halo = exp(-pow(ang / (sz * 5.0), 2.0)) * 0.1;
  float tw = 0.78 + 0.22 * sin(uT * 0.9 + h * 44.0);
  vec3 tint = mix(vec3(0.76, 0.83, 1.0), vec3(1.0, 0.95, 0.87), hash(c + sd + 21.7));
  return tint * mag * (core + halo) * tw * amp;
}
vec3 stars(vec3 d){
  return starLayer(d, vec2(260.0, 150.0), 22.0, 1.5, 0.0)
       + starLayer(d, vec2(110.0, 64.0), 36.0, 3.4, 37.0);
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float tanHalf = 0.3 * uZoom;
  float D = 30.0;
  vec3 camPos = vec3(sin(uAz) * cos(uEl), sin(uEl), cos(uAz) * cos(uEl)) * D;
  vec3 fw = normalize(-camPos);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec2 sc = uv * 2.0 * tanHalf;
  if (uMouse.x < 900.0) {
    vec2 dm = uv - uMouse; float lm = length(dm);
    sc += normalize(dm + 1e-5) * exp(-lm * 5.0) * 0.05;
  }
  vec3 dir = normalize(fw + rt * sc.x + up * sc.y);
  float dith = hash(gl_FragCoord.xy * 1.37 + fract(uT) * 19.0);
  vec3 col = vec3(0.0); float trans = 1.0; bool caught = false;
  float bimp = length(cross(camPos, dir));
  float pd = dot(camPos, dir);
  float disc = pd * pd - (dot(camPos, camPos) - 256.0);
  vec3 outDir = dir;
  if (disc > 0.0) {
    vec3 pos = camPos + dir * max(-pd - sqrt(disc), 0.0);
    vec3 hv = cross(pos, dir); float h2 = dot(hv, hv);
    float prevY = pos.y;
    for (int i = 0; i < 120; i++) {
      if (float(i) >= uSteps || trans < 0.02) break;
      float r = length(pos);
      if (r > 17.0) break;
      float nearPlane = 1.0 - smoothstep(0.5, 2.2, abs(pos.y));
      float dt = clamp(r * 0.05, 0.018, 0.55) * mix(1.0, 0.34, nearPlane) * (1.0 + smoothstep(7.0, 16.0, r) * 1.8) * (1.0 + (dith - 0.5) * 0.08 * smoothstep(2.4, 7.0, r));
      vec3 acc = -1.5 * h2 * pos / pow(r, 5.0);
      vec3 nd = dir + acc * dt;
      vec3 np = pos + nd * dt;
      vec3 seg = np - pos;
      float tc = clamp(-dot(pos, seg) / max(1e-4, dot(seg, seg)), 0.0, 1.0);
      if (length(pos + seg * tc) < 1.02 || (bimp < 2.6 && r < 6.0)) { trans = 0.0; caught = true; break; }
      if (prevY * np.y < 0.0) {
        float fr = prevY / (prevY - np.y);
        vec3 cp = mix(pos, np, fr);
        float rr = length(cp.xz);
        if (rr > 2.15 && rr < 15.5) {
          float phi = atan(cp.z, cp.x);
          float om = 1.0 / pow(rr, 1.5);
          float a = phi + om * uT * 26.0;
          float n1 = fbm(vec2(a * 0.5 + 2.0, log(rr) * 12.0));
          float n2 = fbm(vec2(a * 1.1 - 1.0, log(rr) * 25.0 + 7.0));
          float ridge = (1.0 - abs(2.0 * n1 - 1.0)) * 0.8 + (1.0 - abs(2.0 * n2 - 1.0)) * 0.3;
          // Softer exponent → fewer aliased hairlines under motion
          float fil = pow(clamp(ridge - 0.12, 0.0, 1.0), 1.75) * 2.35 + 0.2;
          float edge = smoothstep(2.15, 3.4, rr) * (1.0 - smoothstep(7.0, 15.5, rr));
          float dens = edge * fil;
          float tt = clamp((rr - 2.2) / 7.5, 0.0, 1.0);
          vec3 c = mix(vec3(1.0, 0.99, 0.975), vec3(0.66, 0.4, 0.18), pow(tt, 1.05));
          vec3 vel = normalize(cross(vec3(0.0, 1.0, 0.0), cp)) * (0.46 / sqrt(rr / 3.0));
          float dop = 1.0 / max(0.25, 1.0 - dot(vel, -nd));
          float beam = clamp(pow(dop, 3.1), 0.12, 7.0);
          float bright = 1.7 / pow(rr / 2.6, 2.1);
          float burst = 1.0 + uFlare * 3.2 * smoothstep(0.35, 1.0, cos(phi - uFlareA)) * (1.0 - smoothstep(3.0, 7.5, rr));
          float budget = 1.0 - smoothstep(0.92, 1.0, float(i) / uSteps);
          col += c * dens * bright * beam * burst * trans * budget * uGlow;
          trans *= exp(-dens * uDense * 2.3);
        }
      }
      prevY = np.y; pos = np; dir = nd; outDir = nd;
    }
  }
  if (!caught) col += stars(normalize(outDir)) * trans * uStars * (0.25 + 0.75 * smoothstep(2.6, 5.5, bimp));
  float bIn = max(0.0, 2.605 - bimp), bOut = max(0.0, bimp - 2.605);
  float ring = exp(-pow(bIn * 42.0, 2.0)) * exp(-pow(bOut * 11.0, 2.0));
  col += vec3(1.0, 0.99, 0.97) * ring * 2.4 * uGlow;
  col += vec3(1.0, 0.96, 0.9) * exp(-pow(bimp - 2.66, 2.0) * 26.0) * 0.24 * uGlow;
  col += vec3(1.0, 0.9, 0.8) * exp(-pow(bimp - 2.9, 2.0) * 0.5) * 0.045 * uGlow;
  col *= 0.6 * (1.0 + uFlash * 1.3);
  vec2 hd = uv - uHot;
  float ana = exp(-abs(hd.y) * 150.0) * exp(-abs(hd.x) * 7.0);
  col += vec3(1.0, 0.94, 0.86) * ana * uHotI * 0.35;
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = clamp((col - 0.5) * 1.07 + 0.5, 0.0, 1.0);
  float vg = 1.0 - 0.72 * pow(clamp(length(uv * vec2(uRes.x / uRes.y, 1.0)) * 0.95, 0.0, 1.0), 1.9);
  col *= vg;
  col += (hash(gl_FragCoord.xy + fract(uT) * vec2(37.0, 71.0)) - 0.5) * uGrain * 0.055;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
