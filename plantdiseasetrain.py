import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import matplotlib.pyplot as plt
import json




# 📁 Dataset Path
DATASET_DIR = "plantdisease/PlantVillage/PlantVillage"  

# ⚙️ Parameters
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10

# 📊 Data Preprocessing
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True,
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2
)


train_data = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    subset='training'
)

val_data = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    subset='validation'
)

# 🧠 Model (Transfer Learning - MobileNetV2)
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False  # freeze base model

x = base_model.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.5)(x)
output = layers.Dense(train_data.num_classes, activation='softmax')(x)

model = tf.keras.Model(inputs=base_model.input, outputs=output)


# ⚙️ Compile
# base_model.trainable = True

for layer in base_model.layers[:-50]:
    layer.trainable = False
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 🚀 Train
# history = model.fit(
#     train_data,
#     validation_data=val_data,
#     epochs=EPOCHS
# )

# 💾 Save Model
# model.save("plant_disease_model.h5")

# print("✅ Model saved as plant_disease_model.h5")

# # 📈 Plot Accuracy
# plt.plot(history.history['accuracy'], label='Train Accuracy')
# plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
# plt.legend()
# plt.show()

with open("classes.json", "w") as f:
    json.dump(train_data.class_indices, f)

print("✅ Classes saved")