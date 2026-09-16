from pathlib import Path
import json
import os
import subprocess
import sys
import time


WANGP_ROOT = Path(r"C:\Users\WINDOWS\AI\Wan2GP")
OUTPUT_DIR = WANGP_ROOT / "outputs-gym-os"
IMAGE_START = WANGP_ROOT / "inputs" / "gym-os-triceps-kickback-start.png"
IMAGE_END = WANGP_ROOT / "inputs" / "gym-os-triceps-kickback-end.png"
FFMPEG = WANGP_ROOT / "ffmpeg_bins" / "ffmpeg.exe"
FFPROBE = WANGP_ROOT / "ffmpeg_bins" / "ffprobe.exe"
PROJECT_VIDEO = Path(
    r"C:\xampp\htdocs\GYM-OS\public\assets\doom-exercises\Triceps\dumbbell-triceps-kickback.mp4"
)
TARGET_DURATION_SECONDS = 2.0


def get_duration(video_path):
    completed = subprocess.run(
        [
            str(FFPROBE),
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(completed.stdout.strip())


def export_target_video(video_path):
    duration = get_duration(video_path)
    factor = TARGET_DURATION_SECONDS / duration
    subprocess.run(
        [
            str(FFMPEG),
            "-y",
            "-i",
            str(video_path),
            "-filter:v",
            (
                f"setpts={factor:.6f}*PTS,"
                "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,"
                "tpad=stop_mode=clone:stop_duration=0.35,"
                f"trim=duration={TARGET_DURATION_SECONDS:.2f},setpts=PTS-STARTPTS"
            ),
            "-an",
            "-movflags",
            "+faststart",
            str(PROJECT_VIDEO),
        ],
        check=True,
    )
    return PROJECT_VIDEO, get_duration(PROJECT_VIDEO), duration


def main():
    os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
    os.environ.setdefault("TQDM_DISABLE", "1")

    sys.path.insert(0, str(WANGP_ROOT))

    from shared.api import init

    OUTPUT_DIR.mkdir(exist_ok=True)

    session = init(
        root=WANGP_ROOT,
        output_dir=OUTPUT_DIR,
        cli_args=["--attention", "sdpa", "--profile", "4.5"],
        console_output=False,
        console_isatty=False,
    )

    settings = session.get_default_settings("fun_inp_1.3B")
    settings.update(
        {
            "model_type": "fun_inp_1.3B",
            "image_prompt_type": "SE",
            "image_start": str(IMAGE_START),
            "image_end": str(IMAGE_END),
            "prompt": (
                "A short exercise demonstration video of a futuristic armored athlete "
                "performing a dumbbell triceps kickback from the start image to the end image. "
                "The body stays in one place. The camera stays still. Only the upper arm holding "
                "the dumbbell extends backward from bent elbow to straight elbow. Keep one athlete "
                "only, no split screen, no duplicated start and finish pose, no side by side poses, "
                "no text, no logo."
            ),
            "negative_prompt": (
                "split screen, duplicated body, two athletes, start and end pose side by side, "
                "extra arms, deformed hands, changing equipment, incorrect elbow movement, "
                "body twisting, camera shake, text, watermark, blurry, flickering, distorted joints"
            ),
            "resolution": "832x480",
            "video_length": 17,
            "num_inference_steps": 8,
            "guidance_scale": 4.0,
            "flow_shift": 10.0,
            "seed": 12345,
        }
    )

    print("Submitting WanGP job:")
    print(
        json.dumps(
            {
                key: settings.get(key)
                for key in [
                    "model_type",
                    "image_prompt_type",
                    "image_start",
                    "image_end",
                    "resolution",
                    "video_length",
                    "num_inference_steps",
                    "guidance_scale",
                    "seed",
                ]
            },
            indent=2,
        )
    )

    job = session.submit_task(settings)
    last_message = None
    last_printed_at = 0

    for event in job.events.iter(timeout=1.0):
        if event.kind == "progress":
            progress = event.data
            message = (
                f"PROGRESS {getattr(progress, 'progress', '')} "
                f"{getattr(progress, 'phase', '')} "
                f"{getattr(progress, 'current_step', '')}/{getattr(progress, 'total_steps', '')}"
            )
            now = time.monotonic()
            if message != last_message and now - last_printed_at >= 10:
                print(message)
                last_message = message
                last_printed_at = now
        elif event.kind == "preview":
            print("PREVIEW")

    result = job.result()
    print("RESULT", result.success)
    print("FILES", result.generated_files)
    print("ERRORS", [getattr(error, "message", str(error)) for error in result.errors])

    if result.success and result.generated_files:
        final_video, final_duration, source_duration = export_target_video(
            Path(result.generated_files[0])
        )
        print("FIRST_VIDEO", final_video)
        print("SOURCE_DURATION_SECONDS", f"{source_duration:.2f}")
        print("DURATION_SECONDS", f"{final_duration:.2f}")


if __name__ == "__main__":
    main()
