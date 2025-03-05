<script lang="ts">
  let { size = "medium" } = $props();
</script>

<div class="flex justify-center items-center" aria-label="Loading">
  <div
    class="animate-spin rounded-full border-4 border-t-white border-l-white border-r-transparent border-b-transparent"
    class:w-6={size === "small"}
    class:h-6={size === "small"}
    class:w-10={size === "medium"}
    class:h-10={size === "medium"}
    class:w-16={size === "large"}
    class:h-16={size === "large"}
  ></div>
</div>
