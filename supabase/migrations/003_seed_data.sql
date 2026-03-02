-- iconic-duo app - Datos de prueba (OPCIONAL)
-- Este script es OPCIONAL y solo debe ejecutarse en desarrollo para testear
-- NO ejecutar en producción

-- ========================================
-- LIMPIAR DATOS DE PRUEBA ANTERIORES
-- ========================================

-- Descomentar estas líneas si quieres reiniciar los datos de prueba
-- DELETE FROM duo_results;
-- DELETE FROM user_sessions;

-- ========================================
-- DATOS DE PRUEBA: user_sessions
-- ========================================

-- Sesión de prueba 1
INSERT INTO user_sessions (id, profile) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '{
    "archetype": "El observador silencioso",
    "core_trait": "Reflexivo y analítico",
    "relational_role": "El que escucha primero",
    "conflict_style": "Evita confrontación directa",
    "narrative_tendency": "Prefiere historias abiertas",
    "cultural_fingerprint": "Consume contenido independiente",
    "raw_notes": "Usuario de prueba - perfil introspectivo"
  }'::jsonb
);

-- Sesión de prueba 2
INSERT INTO user_sessions (id, profile) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '{
    "archetype": "El catalizador",
    "core_trait": "Energético y propositivo",
    "relational_role": "El que inicia movimiento",
    "conflict_style": "Confronta de manera directa pero constructiva",
    "narrative_tendency": "Necesita resolución clara",
    "cultural_fingerprint": "Consume mainstream con criterio",
    "raw_notes": "Usuario de prueba - perfil activo"
  }'::jsonb
);

-- ========================================
-- DATOS DE PRUEBA: duo_results
-- ========================================

-- Resultado 1 para sesión 1
INSERT INTO duo_results (session_id, b_name, b_profile, result) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'María',
  '{
    "archetype": "La arquitecta de mundos",
    "core_trait": "Creativa y estructurada",
    "relational_role": "La que construye el marco",
    "conflict_style": "Busca soluciones sistémicas",
    "narrative_tendency": "Ama las historias en capas",
    "cultural_fingerprint": "Mezcla alta y baja cultura",
    "raw_notes": "Usuario B de prueba - perfil creativo"
  }'::jsonb,
  '{
    "duo_name": "Los que llegan tarde pero llegan bien",
    "cultural_reference": {
      "reference": "Joel y Ellie de The Last of Us",
      "explanation": "Uno carga la experiencia, el otro carga el futuro"
    },
    "dynamic": "Uno genera velocidad, el otro genera dirección. El problema es que raramente están de acuerdo sobre cuándo ir rápido y hacia dónde. Lo que los sostiene es que los dos lo saben y ninguno lo dice.",
    "individual_analysis": {
      "person_a": {
        "archetype_name": "El que llega tarde con la respuesta correcta",
        "role_in_duo": "Aporta claridad cuando ya todo el mundo tomó una decisión"
      },
      "person_b": {
        "archetype_name": "La que ya lo sabía pero esperó que lo descubrieras solo",
        "role_in_duo": "Mantiene el rumbo sin forzar el camino"
      }
    },
    "green_flags": [
      "Como dúo generan una energía tan específica que el resto del grupo sabe que algo bueno está por pasar",
      "Tienen una forma de resolver problemas que parece caótica desde afuera pero funciona perfectamente para ellos"
    ],
    "red_flags": [
      "Juntos tienen tanta claridad sobre ciertas cosas que pueden volverse difíciles de convencer desde afuera",
      "Como dúo pueden generar una burbuja tan cómoda que el resto del mundo se siente como ruido"
    ],
    "probable_arc": "En algún momento van a terminar siendo los que resuelven algo que nadie más quería resolver. Y van a disfrutarlo más de lo que admiten."
  }'::jsonb
);

-- Resultado 2 para sesión 1
INSERT INTO duo_results (session_id, b_name, b_profile, result) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Carlos',
  '{
    "archetype": "El pragmático emocional",
    "core_trait": "Equilibrio entre razón y sentimiento",
    "relational_role": "El que mantiene las cosas reales",
    "conflict_style": "Directo pero empático",
    "narrative_tendency": "Valora la autenticidad sobre el artificio",
    "cultural_fingerprint": "Ecléctico con preferencia por lo genuino",
    "raw_notes": "Usuario B de prueba - perfil equilibrado"
  }'::jsonb,
  '{
    "duo_name": "Los que saben pero no dicen",
    "cultural_reference": {
      "reference": "Sherlock y Watson — pero en la versión donde Watson ya sabe más de lo que deja ver",
      "explanation": "La complementariedad no está en lo que falta, sino en lo que cada uno decide compartir"
    },
    "dynamic": "Uno procesa en silencio, el otro verbaliza con intención. Raramente se pisan porque operan en frecuencias distintas pero compatibles. El riesgo es que ambos asumen que el otro entiende más de lo que realmente expresan.",
    "individual_analysis": {
      "person_a": {
        "archetype_name": "El que convierte el silencio en estrategia",
        "role_in_duo": "Aporta la pausa necesaria antes de que las cosas se aceleren demasiado"
      },
      "person_b": {
        "archetype_name": "El que traduce la intuición en acción",
        "role_in_duo": "Convierte lo que ambos sienten en algo que se puede hacer"
      }
    },
    "green_flags": [
      "Como dúo tienen una capacidad inusual para tomar decisiones sin necesitar explicitar todo el proceso",
      "Generan confianza sin esfuerzo consciente — la gente nota que funcionan bien juntos"
    ],
    "red_flags": [
      "Pueden dar la impresión de ser un círculo cerrado incluso cuando no lo intentan",
      "Juntos asumen que el contexto es obvio y pueden frustrar a quien necesita más información"
    ],
    "probable_arc": "Hay un proyecto o situación en su futuro cercano donde van a darse cuenta de que ya estaban alineados sin haberlo hablado. Va a ser satisfactorio y un poco inquietante a la vez."
  }'::jsonb
);

-- Resultado 1 para sesión 2
INSERT INTO duo_results (session_id, b_name, b_profile, result) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Ana',
  '{
    "archetype": "La guardiana de detalles",
    "core_trait": "Meticulosa y leal",
    "relational_role": "La que recuerda lo importante",
    "conflict_style": "Paciente pero firme",
    "narrative_tendency": "Valora la consistencia de personajes",
    "cultural_fingerprint": "Profundiza en lo que le interesa",
    "raw_notes": "Usuario B de prueba - perfil detallista"
  }'::jsonb,
  '{
    "duo_name": "El plan B que siempre termina siendo el A",
    "cultural_reference": {
      "reference": "Marge y Homer Simpson — no por la dinámica exacta, sino porque uno sostiene mientras el otro improvisa",
      "explanation": "La estructura no es rígida, es adaptativa, y eso los hace más resilientes de lo que parecen"
    },
    "dynamic": "Uno propone, el otro refina. Uno avanza, el otro asegura. No es que se complementen — es que se corrigen mutuamente sin que se sienta como corrección. El resultado es que raramente fallan, pero tampoco sorprenden.",
    "individual_analysis": {
      "person_a": {
        "archetype_name": "El que convierte el impulso en momentum",
        "role_in_duo": "Genera movimiento y posibilidad, confía en que el otro va a aterrizar lo importante"
      },
      "person_b": {
        "archetype_name": "La que sostiene el arco cuando el otro quiere cerrar la historia",
        "role_in_duo": "Se asegura de que nada importante se pierda en la velocidad"
      }
    },
    "green_flags": [
      "Como dúo son increíblemente confiables — si dicen que van a hacer algo, lo hacen",
      "Tienen un ritmo propio que no depende de validación externa"
    ],
    "red_flags": [
      "Pueden volverse demasiado predecibles y perder espontaneidad con el tiempo",
      "Juntos pueden priorizar la estabilidad sobre el crecimiento sin darse cuenta"
    ],
    "probable_arc": "Van a enfrentar una situación donde el camino obvio no funciona y van a tener que improvisar juntos. Va a ser incómodo al principio, pero van a salir mejor parados de lo que esperan."
  }'::jsonb
);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Listar todas las sesiones de prueba
SELECT
  id,
  profile->>'archetype' as archetype,
  created_at
FROM user_sessions
ORDER BY created_at DESC;

-- Listar todos los resultados de prueba
SELECT
  id,
  b_name,
  result->>'duo_name' as duo_name,
  created_at
FROM duo_results
ORDER BY created_at DESC;

-- Contar resultados por sesión
SELECT
  us.id as session_id,
  us.profile->>'archetype' as user_a_archetype,
  COUNT(dr.id) as duo_count
FROM user_sessions us
LEFT JOIN duo_results dr ON dr.session_id = us.id
GROUP BY us.id, us.profile
ORDER BY duo_count DESC;
