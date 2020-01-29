const translateObjectsConfig = function (pipTranslateProvider) {
    // Set translation strings for the module
    pipTranslateProvider.translations('en', {
        'OBJECTS': 'Objects',
        'CONFIGURATION_OBJECTS_ADD_GROUPS': 'Add into groups',
        'CONFIG_OBJECT_NAME': 'Object name',
        'GENERATE_PIN': 'Generate pin',
        'NEW_OBJECT': 'New object',
        'GENERATE_RANDOM_PIN': 'Generate random pin',
        'CONFIG_OBJECTS_GROUPS_EMPTY': "The object has no groups",
        'DELETE_OBJECT': 'Delete object ',
        'CONFIG_OBJECTS_EMPTY': 'Object were not found',
        'OBJECTS_EDIT_DESCRIPTION_ASSET': 'Description',
        'MONITORING_OBJECTS_DETAILS': 'Objects',
        'CONFIG_GROUPS_BACK': 'Leave group',
        'CONFIG_GROUPS_BACK_OK': 'Leave',
        'CONFIG_PERSON_NAME': 'First and last name',
        'CONFIG_OBJECTS_EMPTY1': 'Objects are people, equipment or assets. When an object has an attached tracker the system can monitor its activities and assess them based on predefined rules.',

        OBJECT_EMAIL_VALIDATE_ERROR: 'Enter a valid email',
        OBJECT_PHONE_VALIDATE_ERROR: 'Use E.164 to format phone numbers: +xxxxxxxxxxx',
        OBJECT_CATEGORY_REQUIRED_ERROR: 'Set category',
        OBJECT_TYPE_REQUIRED_ERROR: 'Set type',
        OBJECT_PERSON_NAME_REQUIRED_ERROR: 'Enter person name',
        OBJECT_NAME_REQUIRED_ERROR: 'Enter object name',
        OBJECT_NAME_UNIQUE_ERROR: 'Name must unique',
        OBJECT_ID: 'System identifier',
        LOADING_OBJECTS: 'Loading objects',
        OBJECTS_ADD_TITLE: 'Add object',
        OBJECTS_DETAILS_TITLE: 'Object',
        OBJECTS_EDIT_TITLE: 'Edit',
        'INFORMATION': "Information",
        'TYPE': 'Type',
        'SETTINGS_BASIC_INFO_DESCRIPTION': 'Position',
    });

    pipTranslateProvider.translations('ru', {
        'OBJECTS': 'Объекты',
        'CONFIGURATION_OBJECTS_ADD_GROUPS': 'Добавить в группы',
        'CONFIG_OBJECT_NAME': 'Название объекта',
        'GENERATE_PIN': 'Сгенерировать пин код',
        'NEW_OBJECT': 'Новый объект',
        'GENERATE_RANDOM_PIN': 'Случайный пин код',
        'DELETE_OBJECT': 'Удалить объект ',
        'CONFIG_OBJECTS_GROUPS_EMPTY': 'Объект не состоит в группах',
        'OBJECTS_EDIT_DESCRIPTION_ASSET': 'Краткое описание',
        'CONFIG_OBJECTS_EMPTY': 'Объекты наблюдения не найдены',
        'CONFIG_PERSON_NAME': 'Имя и фамилия',
        'MONITORING_OBJECTS_DETAILS': 'Объект',
        'CONFIG_GROUPS_BACK': 'Выйти из группы',

        'CONFIG_GROUPS_BACK_OK': 'Выйти',
        'CONFIG_OBJECTS_EMPTY1': 'Объектами являются люди, машины и механизмы. При наличии прикрепленного трекера система способна наблюдать за их действиями и оценивать на основе определенных правил.',

        OBJECT_EMAIL_VALIDATE_ERROR: 'Введите адрес электронной почты',
        OBJECT_PHONE_VALIDATE_ERROR: 'Используйте E.164 формат для телефонных номеров: +xxxxxxxxxxx',
        OBJECT_CATEGORY_REQUIRED_ERROR: 'Задайте категорию',
        OBJECT_TYPE_REQUIRED_ERROR: 'Задайте тип',
        OBJECT_PERSON_NAME_REQUIRED_ERROR: 'Введите имя и фамилию',
        OBJECT_NAME_REQUIRED_ERROR: 'Введите наименование объекта',
        OBJECT_NAME_UNIQUE_ERROR: 'Имя должно быть уникальным',
        OBJECT_ID: 'Системный идентификатор',
        LOADING_OBJECTS: 'Загрузка объектов',
        OBJECTS_ADD_TITLE: 'Новый объект',
        OBJECTS_DETAILS_TITLE: 'Объект',
        OBJECTS_EDIT_TITLE: 'Редактирование',
        'INFORMATION': "Информация",
        'TYPE': 'Тип',
        'SETTINGS_BASIC_INFO_DESCRIPTION': 'Должность',
    });
}


angular
    .module('iqsConfigObjects')
    .config(translateObjectsConfig);