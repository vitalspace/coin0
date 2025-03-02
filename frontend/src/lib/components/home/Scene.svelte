<script lang="ts">
  import { T, useRenderer, useTask, useThrelte } from "@threlte/core";
  import { interactivity, HTML, Stars } from "@threlte/extras";
  import { Spring } from "svelte/motion";
  import { scrollPercentage } from "../../stores/stores";
  import { Vector3 } from "three";
  import Coins from "./Coins.svelte";
  import Lights from "./Lights.svelte";

  interactivity();
  const { camera } = useThrelte();

  const coinsOpacity = new Spring(1, {
    stiffness: 0.1,
    damping: 0.4,
  });

  const lerp = (x: number, y: number, a: number) => (1 - a) * x + a * y;
  const scaleObject = (start: number, end: number) =>
    Math.max(0, ($scrollPercentage - start) / (end - start));

  const setUpCamera = () => {
    // camera.current.lookAt(0, 0, 0);
    camera.current.position.set(0, 0, 4);
  };

  let html1 = new Vector3(-9.2, 0, 0);
  const opacity = new Spring(0);

  const animations = [
    {
      range: [0, 25],
      update: () => {
        const progress = scaleObject(0, 25);
        html1.y = lerp(15, 0, progress);

        if (progress > 0.65) {
          // opacity.target = 1; // Controla la opacidad
          opacity.set(1);
        } else {
          // opacity.target = 0; // Controla la opacidad
          opacity.set(0);
        }

        // html1.x = lerp(0, 0, progress);
        // opacity.target = progress; // Controla la opacidad
      },
    },
    {
      range: [0, 10],
      update: () => {
        // camera.current.position.x = lerp(0, 20, scaleObject(0, 15));
        coinsOpacity.set(1);
      },
    },

    {
      range: [10, 20],
      update: () => {
        // camera.current.position.x = lerp(0, 20, scaleObject(0, 15));
        coinsOpacity.set(0);
      },
    },

    {
      range: [80, 100],
      update: () => {
        // camera.current.position.x = lerp(0, 4, scaleObject(80, 100));
        // camera.current.position.y = lerp(1, 2, scaleObject(80, 100));
      },
    },
  ];
  setUpCamera();

  useTask((delta) => {
    animations.forEach(({ range, update }) => {
      if ($scrollPercentage >= range[0] && $scrollPercentage <= range[1]) {
        update();
      }
    });
  });
</script>

<T.DirectionalLight position={[0, 10, 10]} castShadow color="white" />

<Lights />
<Coins
  fallback={null}
  error={null}
  children={null}
  opacity={coinsOpacity.current}
/>

<Stars
  speed={2}
  fade={true}
  radius={100}
  depth={50}
  count={5000}
  factor={4}
  saturation={0}
/>
