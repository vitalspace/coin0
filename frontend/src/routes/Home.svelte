<script lang="ts">
  import Hero from "../lib/components/home/Hero.svelte";
  import Canvas from "../lib/components/home/Canvas.svelte";
  import { scrollPercentage } from "../lib/stores/stores";

  

  $effect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight } = document.documentElement;
      const height = window.innerHeight;
      const percentage = (scrollTop / (scrollHeight - height)) * 100;
      scrollPercentage.set(percentage);
    };
            
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<main class="w-full h-screen font-sans absolute justify-center items-center">
  <!-- <div class="fixed top-0 left-0 w-full h-screen z-10 text-white">
    {$scrollPercentage}
  </div> -->

  <Hero />

  <section class="min-h-screen p-5 text-2xl text-center text-white">
    <!-- <h2>Begin scrolling to see things change</h2> -->
  </section>

  <section class="min-h-screen p-5 text-white">
    <div
      class="container mx-auto min-h-screen grid place-content-center justify-end px-20"
    >
      <div class=" w-3xl select-none space-y-2 ">
        <h2 class=" font-bold text-center text-4xl mb-12">
          Create your token in 3 simple steps
        </h2>

        <div class="flex gap-4 text-justify">
          <div class="border rounded-md border-white/10 p-6 bg-white/5 grid gap-2">
            <h3 class="text-lg font-semibold">Choose your token</h3>
            <p class="text-md text-gray-400">
              Select your preferred blockchain and configure basic token
              parameters
            </p>
          </div>

          <div class="border rounded-md border-white/10 p-6 bg-white/5 grid gap-2">
            <h3 class="text-lg font-semibold">Customize</h3>
            <p class="text-md text-gray-400">
              Set your token's name, symbol, and initial supply - no coding
              required
            </p>
          </div>

          <div class="border rounded-md border-white/10 p-6 bg-white/5 grid gap-2">
            <h3 class="text-lg font-semibold">Launch</h3>
            <p class="text-md text-gray-400">
              Deploy your token with one click and start building your community
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="min-h-screen p-5 text-2xl text-center">
    <h2>Changing Objects Rotation</h2>
    <p>The cubes rotation is now changing</p>
  </section>

  <section class="min-h-screen p-5 text-2xl text-center">
    <h2>Changing Camera Position</h2>
    <p>The camera position is now changing</p>
  </section>

  <section class="min-h-screen p-5 text-2xl text-center">
    <h2>You are at the bottom</h2>
    <p>The cube will now be auto rotating</p>
    <p>Now you can scroll back to the top to reverse the animation</p>
  </section>
  <Canvas />
</main>
