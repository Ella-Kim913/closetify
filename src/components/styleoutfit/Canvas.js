import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import { getStorage, ref as storageRef, getDownloadURL, uploadString } from "firebase/storage";
import { getDatabase, ref as dbRef, push as FirebasePush  } from "firebase/database";
import { useNavigate } from 'react-router-dom';

// canvas with information, button, etc.
export function CanvasFrame(props) {
    const navigateTo = useNavigate(); // navigation hook

    // get current date and format it
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const today = new Date();
    const formattedDate = formatDate(today);

    let stageRef = useRef(null);
    const handleExport = async (event) => {
        event.preventDefault();
        if (stageRef.current) {
            const uri = stageRef.current.toDataURL();
            const id = today.getTime()

            const imageRef = storageRef(getStorage(), `outfitsImg/${id}.png`);
            try {
                // Upload the image to Firebase Storage
                const uploadResult = await uploadString(imageRef, uri, 'data_url');

                // Get the download URL for the uploaded image
                const downloadURL = await getDownloadURL(uploadResult.ref);

                // Save the object to Firebase Realtime Database
                const { userId, userName, userImg } = props.currentUser;
                const newOutfitObj = {
                    "userId": userId,
                    "userName": userName,
                    "userImg": userImg,
                    "timestamp": Date.now(),
                    "imageUrl": downloadURL,
                    "outfitDate": formattedDate
                }

                // Reference for the object in Firebase Realtime Database
                const outfitsRef = dbRef(getDatabase(), `outfits`);
                FirebasePush(outfitsRef, newOutfitObj);

                navigateTo('/home');
            } catch (error) {
                console.error('Error uploading image or saving data:', error);
            }
        } else {
            console.error('Stage reference is not set');
        }
    }

    // Measures size of an outer div so Canvas knows how big to be
    const divRef = useRef();
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            if (divRef.current) {
                setWidth(divRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    return (
        <div className="col1">
            <div className="card">
                <div className="card-header">
                    <h1>{formattedDate}</h1>
                    <div className="cta-button" role="button" onClick={handleExport}>
                        Save
                    </div>
                </div>
                <div className="card-content glass" ref={divRef}>
                    {/* -32 because of padding size */}
                    <Canvas
                        selectedClothes={props.selectedClothes}
                        size={width - 32}
                        ref={stageRef} />
                </div>
            </div>
        </div>
    );
}

// code modified from https://konvajs.org/docs/react/Transformer.html
const Canvas = forwardRef((props, ref) => {
    const { selectedClothes } = props;
    const [selectedId, selectImage] = useState(null); // Add back the selectImage state

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectImage(null);
        }
    };

    const imagesArray = selectedClothes.map((img, i) => {
        return (
            <URLImage
                key={img.id}
                shapeProps={img}
                isSelected={img.id === selectedId}
                onSelect={() => {
                    selectImage(img.id);
                }}
                onChange={(newAttrs) => {
                    // Implement onChange logic if needed
                }}
            />
        );
    });

    return (
        <div className="card-img">
            <Stage
                width={props.size}
                height={props.size}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                ref={ref}>
                <Layer>
                    {imagesArray}
                </Layer>
            </Stage>
        </div>
    );
});


// constructs an image that can be transformed in the canvas
// code modified from https://konvajs.org/docs/react/Images.html
const URLImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
    // loads image using useImage hook
    const [image] = useImage(shapeProps.src);

    const imageRef = useRef();
    const trRef = useRef();

    // bind transformer to image if it's selected
    useEffect(() => {
        if (isSelected) {
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    // constrains size of image if too large
    useEffect(() => {
        if (image) {
            const img = imageRef.current;
            const maxDim = 250;
            const scale = Math.min(maxDim / image.width, maxDim / image.height);

            img.width(image.width * scale);
            img.height(image.height * scale);
        }
    }, [image]);

    return (
        <>
            <Image
                x={shapeProps.x}
                y={shapeProps.y}
                image={image}
                onClick={onSelect}
                onTap={onSelect}
                ref={imageRef}
                draggable
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

