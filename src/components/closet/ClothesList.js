import React, { useState } from 'react';
import options from '../../data/options.json'
export { ClothesList };

function ClothesList(props) {

    const [category, setCategory] = useState('');
    const [weather, setWeather] = useState('');
    const [occasion, setOccasion] = useState('');

    const handleFilterChange = (newCategory, newWeather, newOccasion) => {
        setCategory(newCategory);
        setWeather(newWeather);
        setOccasion(newOccasion);
        props.applyFilterCallback(newCategory, newWeather, newOccasion);
    };

    const { setSelectedClothes, selectedClothes } = props;

    const clickHandler = (event) => {
        const imagePath = event.target.getAttribute('src');
        const selectedImage = selectedClothes.find(img => img.src === imagePath);

        // Check if the clicked image is already selected
        if (selectedImage) {
            // If the image is already selected, remove it
            setSelectedClothes(selectedClothes.filter(img => img.src !== imagePath));
        } else {
            // If the image is not selected, add it
            setSelectedClothes([...selectedClothes,
            {
                src: imagePath,
                x: 10,
                y: 10,
                id: imagePath
            }
            ]);
        }
    }



    const clothesArray = props.data.map(obj => (
        <div className="clothing-item" key={obj.timestamp}>
            <img src={obj.img} alt={obj.alt} onClick={clickHandler} key={obj.timestamp} />
        </div>
    ));

    const weatherOptions = options.filterOptions
        .filter(obj => obj.id === "weather")
        .flatMap(obj => obj.options);

    const occasionOptions = options.filterOptions
        .filter(obj => obj.id === "occasion")
        .flatMap(obj => obj.options);

    const categoryOptions = options.filterOptions
        .filter(obj => obj.id === "category")
        .flatMap(obj => obj.options);

    const categoryOptionsArray = categoryOptions.map(option => (
        <SortCategory
            key={option.value}
            active={category == option.value}
            label={option.label}
            name={option.value}
            onClick={() => handleFilterChange(option.value, weather, occasion)}
        />
    ))

    return (<div className="closet-intro">
        <div className="scrollmenu">
            {categoryOptionsArray}
        </div>

        {/* Did not map the Filter level, since individual Filter need to return the value to callbackfunction  */}
        <div className="scrollmenu">
            <FilterPill
                id="weather"
                name="Weather"
                value={weather}
                onChange={e => handleFilterChange(category, e.target.value, occasion)}
                options={weatherOptions}
            />
            <FilterPill
                id="occasion"
                name="Occasion"
                value={occasion}
                onChange={e => handleFilterChange(category, weather, e.target.value, occasion)}
                options={occasionOptions}
            />

        </div>

        <div className='closet'>
            {clothesArray}
        </div>
    </div>
    )
}

function SortCategory(props) {
    let iconclassName = "";
    if (props.active) { iconclassName += 'selected-item' }

    return (
        <div className={"item" + iconclassName}>
            {props.active && <img src="icon/pin.svg" alt="pin" />}
            <a onClick={props.onClick}>{props.label}</a>
        </div>
    )
}

function FilterPill({ timestamp, name, value, onChange, options }) {
    return (
        <div className="filter-pill">
            <select id={timestamp} name={name} value={value} onChange={onChange}>
                <option value="">{name}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

export default FilterPill;