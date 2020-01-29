const translateGroupConfig = function (pipTranslateProvider) {
    // Set translation strings for the module
    pipTranslateProvider.translations('en', {
        'GROUPS_EMPTY': 'Groups were not found',
        'GROUPS_EMPTY1': 'Groups allow to combine objects by various features and and use them in search, rules, events and other places. Examples: Managers, Crew 1, Electricians, Special vehicles',
        'ADD_GROUPS': 'Add groups',
        'GROUPS_EMPTY_OBJECTS': "There are no objects in this group",
        "NEW_GROUP": 'New group',
        "GROUP_NAME": 'Group name',
        'DELETE_GROUP': 'Delete group ',
        'GROUPS_DELETE_OBJECT_GROUP': 'Remove object',
        'GROUPS_DELETE_OBJECT_GROUP_FROM_GROUP': ' from group ',
        'MONITORING_OBJECT_GROUPS_DETAILS': 'Group',
        'ADD_OBJECTS': 'Add objects',
        'GROUPS_REMOVE_OBJECT': 'Remove',
        GROUP: 'Group',
        GROUP_ID: 'System identifier',
        GROUPS_LOADING_TITLE: 'Groups are loading',
        GROUPS_ADD_TITLE: 'New group',
        GROUPS_EDIT_TITLE: 'Edit group',
        GROUPS_DETAILS_TITLE: 'Group',
    });

    pipTranslateProvider.translations('ru', {
        'ADD_OBJECTS': 'Добавить объекты',
        GROUP: 'Группа',
        GROUP_ID: 'Системный идентификатор',
        'GROUPS_DELETE_OBJECT_GROUP': 'Убрать объект ',
        'GROUPS_DELETE_OBJECT_GROUP_FROM_GROUP': ' из группы ',
        'GROUPS_REMOVE_OBJECT': 'Убрать',
        'GROUP_NAME': 'Название группы',
        'DELETE_GROUP': 'Удалить группу ',
        "NEW_GROUP": 'Новая группа',
        'GROUPS_EMPTY_OBJECTS': 'Объекты в группе отсутствуют',
        'ADD_GROUPS': 'Добавить группу',
        'GROUPS_EMPTY': 'Группы объектов не найдены',
        'MONITORING_OBJECT_GROUPS_DETAILS': 'Группа',
        'GROUPS_EMPTY1': 'Группы позволяют сгруппировать объекты по различным признакам и использовать их для поиска, определения правил, записи событий и много другого. Примеры групп: ИТР, Бригада 1, Электрики, Сдельщики, Спец. техника',
        GROUPS_LOADING_TITLE: 'Группы загружаются',
        GROUPS_ADD_TITLE: 'Новая группа',
        GROUPS_EDIT_TITLE: 'Редактирование',
        GROUPS_DETAILS_TITLE: 'Группа',
    });
}

angular
    .module('iqsConfigGroups')
    .config(translateGroupConfig)