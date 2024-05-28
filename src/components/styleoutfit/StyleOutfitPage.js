import React, {useState} from 'react';
import { CanvasFrame } from './Canvas';
import { ClothesList } from '../closet/ClothesList';


export default function StyleOutfit(props) {
    // TODO:
    // make all clothings in Clothes list buttons, where onClick they're added to canvas
    const [selectedClothes, setSelectedClothes] = useState([]);

    // adding will be like, setOnCanvas(onCanvas.push()) ?? is this ok..... or [...onCanvas, new stuff]

    // filtering logic
    const [category, setCategory] = useState('');
    const [weather, setWeather] = useState('');
    const [occasion, setOccasion] = useState('');
    const [aesthetic, setAesthetic] = useState('');

    const applyFilter = (newCategory, newWeather, newOccasion, newAesthetic) => {
        setCategory(newCategory);
        setWeather(newWeather);
        setOccasion(newOccasion);
        setAesthetic(newAesthetic);
    };

    const displayedData = props.ClothesList.filter(item =>
        (category === '' || item.category === category) &&
        (weather === '' || item.weather === weather) &&
        (occasion === '' || item.occasion === occasion) &&
        (aesthetic === '' || item.Aesthetic === aesthetic)
    );


    return (
        <div className="style-content">
            <CanvasFrame selectedClothes={selectedClothes}/>
            <div className="col2">
                <ClothesList
                    data={displayedData}
                    applyFilterCallback={applyFilter}
                    selectedClothes={selectedClothes}
                    setSelectedClothes={setSelectedClothes}
                />
            </div>
        </div>
    );
}