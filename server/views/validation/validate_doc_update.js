function(newDoc, oldDoc, userCtx)
{
  if(newDoc &&
     newDoc.type &&
     oldDoc)
  {
    if(newDoc.type != oldDoc.type)
    {
      throw {changing_type: 'Document cannot change type. ' + newDoc.type + ' -> ' + oldDoc.type};
    }
    if(newDoc.createdBy && (newDoc.createdBy != oldDoc.createdBy))
    {
      throw {changing_owner: 'You cannot change the owner of the document.'};
    }
    if(newDoc.created && (newDoc.created != oldDoc.created))
    {
      throw {changing_created: 'You cannot change the created field of the document.'};
    }
    if(newDoc.uniqueName && (newDoc.uniqueName != oldDoc.uniqueName))
    {
      throw {changing_unique_name: 'You cannot change the uniqueName field of a document.'};
    }
    if(newDoc.type == 'event')
    {
      if(newDoc.objectRef != oldDoc.objectRef)
      {
	throw {changing_objectref: 'You cannot change the objectRef of an event.'};
      }
      if(newDoc.streamId != oldDoc.streamId)
      {
	throw {rehost_event: 'You cannot rehost an event to another stream.'};
      }
    }
    if(newDoc.type == 'shift')
    {
      if(newDoc.space.name != oldDoc.space.name)
      {
	throw {changing_space: 'You cannot change the space of a shift.'};
      }
      if(newDoc.href != oldDoc.href)
      {
	throw {changing_href: 'You cannot change the url of a shift.'};
      }
      if(newDoc.domain != oldDoc.domain)
      {
	throw {changing_domain: 'You cannot change the domain of a shift.'};
      }
    }
  }
}
