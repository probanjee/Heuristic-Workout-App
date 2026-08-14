# Exercise Tutorial Media Sources

The workout tutorial media will use Wikimedia Commons assets whose file pages explicitly provide reuse terms.

| Exercise          | Original media URL                                                                                   | License / attribution                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Push-up           | https://upload.wikimedia.org/wikipedia/commons/8/8f/Pushups.gif                                      | CC BY-SA 4.0; author Wensceslao; source page https://commons.wikimedia.org/wiki/File:Pushups.gif                                |
| Squat             | https://upload.wikimedia.org/wikipedia/commons/2/2e/Squats-4-1.gif                                   | CC BY-SA 3.0; author Everkinetic; source page https://commons.wikimedia.org/wiki/File:Squats-4-1.gif                            |
| Reverse lunge     | https://upload.wikimedia.org/wikipedia/commons/a/af/Lunge-CDC_strength_training_for_older_adults.gif | Public domain; CDC source; source page https://commons.wikimedia.org/wiki/File:Lunge-CDC_strength_training_for_older_adults.gif |
| Alternate push-up | https://upload.wikimedia.org/wikipedia/commons/b/b8/Liegestuetz02_ani_fcm.gif                        | CC BY-SA 4.0; author Frank C. Müller; source page https://commons.wikimedia.org/wiki/File:Liegestuetz02_ani_fcm.gif             |

A dedicated animated plank GIF was not identified in the initial Commons search. The product will keep the existing CSS motion fallback for plank until a suitable openly reusable animated source is verified. Attribution and license links will be surfaced in the tutorial card metadata or project documentation as appropriate.

## Catalog-wide search notes

The verified catalog currently contains seven exercises: bodyweight squat, push-up, reverse lunge, dumbbell row, dumbbell shoulder press, dumbbell Romanian deadlift, forearm plank, and resistance band row.

Additional candidate sources identified for verification:

| Candidate movement  | Source page                                                                                       | Initial finding                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Row pattern         | https://commons.wikimedia.org/wiki/File:Upward_row-CDC_strength_training_for_older_adults.gif     | CDC animation; page identifies the Centers for Disease Control and Prevention and public-domain U.S. federal work. |
| Plank               | https://commons.wikimedia.org/wiki/File:Plank_exercise.svg                                        | Openly licensed static SVG, not yet an animated GIF; may remain a fallback unless an animated source is verified.  |
| Resistance-band row | https://commons.wikimedia.org/wiki/File:Bent_over_rows_with_resistance_bands_01.gif               | Search result identifies a CC BY-SA 4.0 animation; file page and direct download URL still require verification.   |
| Shoulder press      | https://commons.wikimedia.org/wiki/File:Overhead_press-CDC_strength_training_for_older_adults.gif | Search result identifies a likely CDC animation; file page and direct download URL still require verification.     |
| Deadlift            | https://commons.wikimedia.org/wiki/File:Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif       | Search result identifies a deadlift animation; license and direct download URL still require verification.         |

Do not treat search snippets as final licensing evidence; each candidate must be opened and verified from its file page before integration.

## Verified catalog-wide additions

| Exercise                                           | Managed asset                                | Original media URL                                                                                            | License / attribution                                                                                       |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Dumbbell row (closest available row demonstration) | `/fitness-storage/upward-row_e2e2fa37.gif`     | https://upload.wikimedia.org/wikipedia/commons/8/83/Upward_row-CDC_strength_training_for_older_adults.gif     | Public domain; Centers for Disease Control and Prevention; Wikimedia Commons                                |
| Dumbbell shoulder press                            | `/fitness-storage/overhead-press_646ec757.gif` | https://upload.wikimedia.org/wikipedia/commons/b/b2/Overhead_press-CDC_strength_training_for_older_adults.gif | Public domain; Centers for Disease Control and Prevention; Wikimedia Commons                                |
| Dumbbell Romanian deadlift                         | `/fitness-storage/deadlift_67146115.gif`       | https://upload.wikimedia.org/wikipedia/commons/c/cb/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif       | CC BY-SA 4.0; Videoplasty.com; Wikimedia Commons                                                            |
| Resistance-band row                                | `/fitness-storage/band-row_88fc93a7.gif`       | https://upload.wikimedia.org/wikipedia/commons/5/5e/Bent_over_rows_with_resistance_bands_01.gif               | CC BY-SA 4.0; GyorgyGajdos; Wikimedia Commons                                                               |
| Forearm plank                                      | `/fitness-storage/plank_681b0497.svg`          | https://upload.wikimedia.org/wikipedia/commons/3/35/Plank_exercise.svg                                        | CC BY-SA 4.0; Pk0001; Wikimedia Commons; static reference because no openly reusable plank GIF was verified |

The catalog now has real GIF media for every dynamic exercise whose source was verified. The plank remains a licensed static reference with the existing CSS motion fallback; it is not represented as a GIF and should not be described as one until a compatible animated source is verified.

## Additional repository findings

The `omercotkd/exercises-gifs` repository is only a backup host for a Kaggle dataset and explicitly states that the maintainer does not own the content; it is not a sufficient licensing basis for product use. Source: https://github.com/omercotkd/exercises-gifs.

The `chaosbastler/opentraining-exercises` repository states that its exercise images are available under CC BY-SA 3.0, attributed to Everkinetic, and that original images included GIFs. Source: https://github.com/chaosbastler/opentraining-exercises. A plank-specific file still requires exact repository-path and file-level verification before integration.

## Approved GymVisual plank GIF

The plank tutorial uses the approved third-party GymVisual media record `2135-VBAWRPG` from the `hasaneyldrm/exercises-dataset` repository. The dataset record identifies the asset as `videos/2135-VBAWRPG.gif` and attributes the media to GymVisual. The deployed application asset is `/fitness-storage/plank-gymvisual_f5f1daae.gif`.

Usage notice: **Third-party media © GymVisual. Used with attribution; GymVisual and the applicable dataset/media terms govern use.** The dataset documentation states that the media is © GymVisual and provides GymVisual’s source URL: https://gymvisual.com/. The source record is available at https://github.com/hasaneyldrm/exercises-dataset/blob/main/data/exercises.json.
