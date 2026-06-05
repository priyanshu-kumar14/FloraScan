import cv2
from tkinter import Tk, filedialog
import numpy as np
from tensorflow.keras import  models
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import tensorflow as tf
import json
import os
import csv
import traceback

# Load model
model = tf.keras.models.load_model("plant_disease_model.h5")

# Load class names
with open("classes.json") as f:
    class_indices = json.load(f)

class_names = list(class_indices.keys())

DEFAULT_SOLUTION = {
    "common_name": "Unknown Class",
    "cause": "Information missing.",
    "symptoms": "No data available",
    "treatment": "No data available",
    "prevention": "No data available",
}


def normalize_class_name(key):
    if not isinstance(key, str):
        return ''
    key_norm = key.strip().lower()
    key_norm = key_norm.replace(' ', '_').replace('-', '_')
    key_norm = key_norm.replace('.', '')
    key_norm = key_norm.replace('___', '_')
    return '_'.join(part for part in key_norm.split('_') if part)


def load_disease_solutions(csv_path='disease_solution.csv'):
    solutions = {}
    if not os.path.exists(csv_path):
        print(f"[Warning] disease solution file not found: {csv_path}. Using defaults.")
        return solutions

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row.get('class_name') or row.get('class')
            if not key:
                continue
            key_raw = key.strip()
            norm = normalize_class_name(key_raw)
            solutions[key_raw] = {
                'common_name': row.get('common_name', '').strip(),
                'cause': row.get('cause', '').strip(),
                'symptoms': row.get('symptoms', '').strip(),
                'treatment': row.get('treatment', '').strip(),
                'prevention': row.get('prevention', '').strip(),
            }
            if norm and norm not in solutions:
                solutions[norm] = solutions[key_raw]

    print(f"Loaded {len(solutions)} disease solutions from {csv_path}")
    return solutions


disease_solutions = load_disease_solutions('disease_solution.csv')


def get_solution_for_class(class_name):
    norm_key = normalize_class_name(class_name)

    # Debug trace once (can remove later)
    if not disease_solutions:
        print("[Warning] disease_solutions map is empty (check CSV path/file)")

    if class_name in disease_solutions:
        return disease_solutions[class_name]

    if norm_key in disease_solutions:
        return disease_solutions[norm_key]

    # Try alternate delimiters: _ -> ___ and vice versa
    alt1 = class_name.replace('___', '_')
    alt2 = class_name.replace('_', '___')
    for alt in (alt1, alt2):
        if alt in disease_solutions:
            return disease_solutions[alt]
        alt_norm = normalize_class_name(alt)
        if alt_norm in disease_solutions:
            return disease_solutions[alt_norm]

    # fallback to partial-match that includes normalized class name fragments
    for k in disease_solutions:
        if not isinstance(k, str):
            continue
        if norm_key and norm_key in normalize_class_name(k):
            return disease_solutions[k]

    # final fallback: return default but show candidate info
    print(f"[Info] no disease solution match for '{class_name}' (norm '{norm_key}').")
    return DEFAULT_SOLUTION


# Function: Predict image
def predict_image(img):
    img = cv2.resize(img, (224, 224))
    img = np.array(img, dtype=np.float32)
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    
    prediction = model.predict(img)
    result = class_names[np.argmax(prediction)]
    
    return result

try:
    while True:
        print("\nPress:")
        print("1 → Gallery")
        print("2 → Camera")
        print("3 → Quit")

        try:
            choice = input("Enter choice: ").strip()
        except EOFError:
            print("\nEOF from input; exiting gracefully.")
            break
        except KeyboardInterrupt:
            continue

        # 🟢 GALLERY MODE
        if choice == '1':
            Tk().withdraw()
            file_path = filedialog.askopenfilename()

            if file_path:
                img = cv2.imread(file_path)
                if img is None:
                    print("Could not load image; please select another file.")
                else:
                    result = predict_image(img)
                    solution = get_solution_for_class(result)

                    print("Prediction:", result)
                    print("Solution summary:")
                    print("  Common Name:", solution.get('common_name', 'N/A'))
                    print("  Cause:", solution.get('cause', 'N/A'))
                    print("  Symptoms:", solution.get('symptoms', 'N/A'))
                    print("  Treatment:", solution.get('treatment', 'N/A'))
                    print("  Prevention:", solution.get('prevention', 'N/A'))

                    cv2.putText(img, result, (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1,
                                (0, 255, 0), 2)

                    cv2.imshow("Gallery Image", img)
                    print("Press any key in the image window to continue to menu...")
                    cv2.waitKey(0)
                    cv2.destroyAllWindows()

            else:
                print("No file selected. Returning to menu...")

            print("\nReturning to main menu: choose Gallery / Camera / Quit")

        # 🔵 CAMERA MODE
        elif choice == '2':
            cap = cv2.VideoCapture(0)

            try:
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print("Could not read from camera.")
                        break

                    result = predict_image(frame)
                    solution = get_solution_for_class(result)

                    cv2.putText(frame, result, (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1,
                                (0, 255, 0), 2)

                    cv2.imshow("Camera - Press Q to exit", frame)

                    print("Live prediction:", result)
                    print("  Cause:", solution.get('cause', 'N/A'))
                    print("  Treatment:", solution.get('treatment', 'N/A'))
                    print("  Prevention:", solution.get('prevention', 'N/A'))

                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

            except KeyboardInterrupt:
                print("\nCtrl+C detected in camera mode; exiting camera and returning to menu.")
            except Exception as e:
                print("\nUnexpected camera-loop exception:", e)
                traceback.print_exc()
            finally:
                cap.release()
                cv2.destroyAllWindows()

        # ❌ EXIT
        elif choice == '3':
            break

        else:
            print("Invalid choice ❌")

except KeyboardInterrupt:
    print("\nCtrl+C detected; exiting gracefully.")
except Exception as e:
    print("\nUnexpected exception in main loop:", e)
    traceback.print_exc()
finally:
    cv2.destroyAllWindows()