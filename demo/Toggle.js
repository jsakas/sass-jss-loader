import React from 'react';
import injectSheet from 'react-jss';
import styles from './Toggle.scss';

console.log('Toggle styles', styles);


const DrawerToggle = injectSheet(styles)(({ className, bordered, open, id, onChange, classes }) => {
  let classList = [classes.DrawerToggle];
  bordered && classList.push(classes[`${DrawerToggle}--bordered`]);
  className && classList.push(className);

  return (
    <div className={classList.join(' ')}>
      <input className={classes[`DrawerToggle__input`]} type="checkbox" id={id} checked={open} onChange={onChange} />
      <label className={classes[`DrawerToggle__label`]} htmlFor={id}>
        <div className={classes[`DrawerToggle__icon`]}>
          <div className={classes[`DrawerToggle__dot`]}></div>
          <div className={classes[`DrawerToggle__dot`]}></div>
          <div className={classes[`DrawerToggle__dot`]}></div>
          <div className={classes[`DrawerToggle__dot`]}></div>
        </div>
      </label>
    </div>
  );
});

export default DrawerToggle;